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
    public async Task ChangePasswordAsync_UpdatesPassword()
    {
        var (service, userId) = SeedAdmin();
        var ok = await service.ChangePasswordAsync(userId, new ChangePasswordRequest { CurrentPassword = "Admin@123", NewPassword = "NewPass@123" });
        ok.Should().BeTrue();
        var login = await service.LoginAsync(new LoginRequest { Username = "admin", Password = "NewPass@123" });
        login.Should().NotBeNull();
    }
}

internal class FakeEmailService : IEmailService
{
    public Task SendEmailAsync(string to, string subject, string body, bool isHtml = true, CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task SendTemplateEmailAsync(string to, string templateName, IDictionary<string, string> values, CancellationToken cancellationToken = default) => Task.CompletedTask;
}
