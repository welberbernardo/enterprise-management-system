using AutoMapper;
using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.DTOs.Auth;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Options;
using EnterpriseManagement.UnitTests;
using EnterpriseManagement.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Xunit;

namespace EnterpriseManagement.UnitTests;


public class AuthServiceTests
{
    private readonly TestDbContextFixture _fixture = new();

    private (AuthService service, int userId) SeedAdmin()
    {
        var uow = _fixture.CreateUnitOfWork();
        var role = new Role { Name = "Administrator", IsActive = true, CreatedAt = DateTime.UtcNow };
        uow.Repository<Role>().AddAsync(role).Wait();
        uow.SaveChangesAsync().Wait();

        var user = new User
        {
            Username = "admin",
            Email = "admin@x.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "Sys",
            LastName = "Admin",
            RoleId = role.Id,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        uow.Repository<User>().AddAsync(user).Wait();
        uow.SaveChangesAsync().Wait();

        var mapper = new MapperConfiguration(c => c.AddProfile<MappingProfile>()).CreateMapper();
        var jwt = new JwtService(Options.Create(new JwtSettings
        {
            Secret = "SuperSecretKeyForJwtSigningThatIsAtLeast32BytesLong!!",
            Issuer = "Test",
            Audience = "Test",
            AccessTokenExpiryMinutes = 15,
            RefreshTokenExpiryDays = 7
        }));
        var email = new FakeEmailService();
        var audit = new AuditService(_fixture.Context);
        var service = new AuthService(uow, jwt, email, audit, mapper,
            Options.Create(new JwtSettings { RefreshTokenExpiryDays = 7, AccessTokenExpiryMinutes = 15 }));
        return (service, user.Id);
    }

    [Fact]
    public async Task LoginAsync_ReturnsToken_ForValidCredentials()
    {
        var (service, _) = SeedAdmin();
        var result = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" });
        result.Should().NotBeNull();
        result!.AccessToken.Should().NotBeNullOrEmpty();
        result.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_ForInvalidPassword()
    {
        var (service, _) = SeedAdmin();
        var result = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "wrong" });
        result.Should().BeNull();
    }

    [Fact]
    public async Task RegisterAsync_CreatesUser_AndReturnsToken()
    {
        var (service, _) = SeedAdmin();
        var role = _fixture.Context.Roles.First();
        var result = await service.RegisterAsync(new RegisterRequest
        {
            Username = "newuser",
            Email = "new@x.com",
            Password = "Pass@123",
            FirstName = "New",
            LastName = "User",
            RoleId = role.Id
        });
        result.Should().NotBeNull();
        _fixture.Context.Users.Should().Contain(u => u.Username == "newuser");
    }

    [Fact]
    public async Task RefreshTokenAsync_ReturnsNewToken_ForValidRefresh()
    {
        var (service, _) = SeedAdmin();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" });
        var refreshed = await service.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = login!.RefreshToken });
        refreshed.Should().NotBeNull();
    }

    [Fact]
    public async Task RefreshTokenAsync_RejectsReplayAfterRotation()
    {
        var (service, _) = SeedAdmin();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" });
        var first = await service.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = login!.RefreshToken });
        first.Should().NotBeNull();
        first!.RefreshToken.Should().NotBe(login.RefreshToken);

        var replay = await service.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = login.RefreshToken });
        replay.Should().BeNull();

        var second = await service.RefreshTokenAsync(new RefreshTokenRequest { RefreshToken = first.RefreshToken });
        second.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateProfileAsync_DoesNotChangeRoleOrActivation()
    {
        var (service, userId) = SeedAdmin();
        var existing = _fixture.Context.Users.Single(u => u.Id == userId);
        var originalRoleId = existing.RoleId;

        var result = await service.UpdateProfileAsync(userId, new UpdateUserDto
        {
            Email = "updated@example.com",
            FirstName = "Updated",
            LastName = "User",
            RoleId = originalRoleId + 999,
            IsActive = false
        });

        result.Should().NotBeNull();
        var saved = _fixture.Context.Users.Single(u => u.Id == userId);
        saved.RoleId.Should().Be(originalRoleId);
        saved.IsActive.Should().BeTrue();
        saved.Email.Should().Be("updated@example.com");
    }

    [Fact]
    public async Task UpdateProfileAsync_RejectsEmailAlreadyUsedByAnotherUser()
    {
        var (service, userId) = SeedAdmin();
        var roleId = _fixture.Context.Users.Single(u => u.Id == userId).RoleId;
        var uow = _fixture.CreateUnitOfWork();
        await uow.Repository<User>().AddAsync(new User
        {
            Username = "second",
            Email = "second@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("AnotherSecurePass@123"),
            FirstName = "Second",
            LastName = "User",
            RoleId = roleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });
        await uow.SaveChangesAsync();

        var result = await service.UpdateProfileAsync(userId, new UpdateUserDto
        {
            Email = " SECOND@EXAMPLE.COM ",
            FirstName = "Changed",
            LastName = "Admin"
        });

        result.Should().BeNull();
        var unchanged = _fixture.Context.Users.Single(u => u.Id == userId);
        unchanged.Email.Should().Be("admin@x.com");
        unchanged.FirstName.Should().Be("Sys");
    }

    [Fact]
    public async Task ChangePasswordAsync_UpdatesPassword()
    {
        var (service, userId) = SeedAdmin();
        var ok = await service.ChangePasswordAsync(userId, new ChangePasswordRequest { CurrentPassword = "Admin@123", NewPassword = "NewSecurePass@123", ConfirmPassword = "NewSecurePass@123" });
        ok.Should().BeTrue();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "NewSecurePass@123" });
        login.Should().NotBeNull();
    }
    [Fact]
    public async Task ChangePasswordAsync_RejectsMismatchedConfirmation()
    {
        var (service, userId) = SeedAdmin();
        var ok = await service.ChangePasswordAsync(userId, new ChangePasswordRequest
        {
            CurrentPassword = "Admin@123",
            NewPassword = "NewSecurePass@123",
            ConfirmPassword = "DifferentPass@123"
        });
        ok.Should().BeFalse();
        (await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" }))
            .Should().NotBeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_RevokesExistingRefreshTokens()
    {
        var (service, userId) = SeedAdmin();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" });
        login.Should().NotBeNull();

        var changed = await service.ChangePasswordAsync(userId, new ChangePasswordRequest
        {
            CurrentPassword = "Admin@123",
            NewPassword = "NewSecurePass@123",
            ConfirmPassword = "NewSecurePass@123"
        });
        changed.Should().BeTrue();

        var refreshed = await service.RefreshTokenAsync(new RefreshTokenRequest
        {
            RefreshToken = login!.RefreshToken
        });
        refreshed.Should().BeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_RejectsTooShortPassword()
    {
        var (service, userId) = SeedAdmin();
        var ok = await service.ChangePasswordAsync(userId, new ChangePasswordRequest
        {
            CurrentPassword = "Admin@123",
            NewPassword = "Short@123",
            ConfirmPassword = "Short@123"
        });
        ok.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_RejectsPasswordsLongerThan128Characters()
    {
        var (service, userId) = SeedAdmin();
        var oversized = new string('A', 129);
        var changed = await service.ChangePasswordAsync(userId, new ChangePasswordRequest
        {
            CurrentPassword = "Admin@123",
            NewPassword = oversized,
            ConfirmPassword = oversized
        });
        changed.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_RejectsReusingCurrentPassword()
    {
        var (service, userId) = SeedAdmin();
        var changed = await service.ChangePasswordAsync(userId, new ChangePasswordRequest
        {
            CurrentPassword = "Admin@123",
            NewPassword = "Admin@123",
            ConfirmPassword = "Admin@123"
        });
        changed.Should().BeFalse();
    }

    [Fact]
    public async Task RefreshTokenAsync_RejectsTokenBoundToPreviousPassword()
    {
        var (service, userId) = SeedAdmin();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "Admin@123" });
        login.Should().NotBeNull();
        // Password update simulates a concurrent change that occurs after token issuance.
        var user = _fixture.Context.Users.Single(u => u.Id == userId);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("NewSecurePass@123");
        await _fixture.Context.SaveChangesAsync();

        var result = await service.RefreshTokenAsync(new RefreshTokenRequest
        {
            RefreshToken = login!.RefreshToken
        });
        result.Should().BeNull();
    }

}

internal class FakeEmailService : IEmailService
{
    public Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task SendTemplateEmailAsync(string to, string templateName, IDictionary<string, string> values, CancellationToken cancellationToken = default) => Task.CompletedTask;
}
