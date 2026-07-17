using AutoMapper;
using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.UnitTests;
using FluentAssertions;
using Xunit;

namespace EnterpriseManagement.UnitTests;

public class UserServiceTests
{
    private readonly TestDbContextFixture _fixture = new();
    private readonly UserService _service;

    public UserServiceTests()
    {
        var uow = _fixture.CreateUnitOfWork();
        var mapper = new MapperConfiguration(c => c.AddProfile<MappingProfile>()).CreateMapper();
        _service = new UserService(uow, mapper);
        uow.Repository<Role>().AddAsync(new Role { Name = "Staff", CreatedAt = DateTime.UtcNow }).Wait();
        uow.SaveChangesAsync().Wait();
    }

    [Fact]
    public async Task CreateAsync_HashesPassword()
    {
        var role = _fixture.Context.Roles.First();
        var result = await _service.CreateAsync(new CreateUserDto
        {
            Username = "u1",
            Email = "u1@x.com",
            Password = "Pass@123",
            FirstName = "U",
            LastName = "One",
            RoleId = role.Id
        });
        result.Username.Should().Be("u1");
        var fromDb = await _fixture.Context.Users.FindAsync(result.Id);
        BCrypt.Net.BCrypt.Verify("Pass@123", fromDb!.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task GetPagedAsync_PaginatesResults()
    {
        var role = _fixture.Context.Roles.First();
        for (int i = 0; i < 5; i++)
        {
            await _service.CreateAsync(new CreateUserDto { Username = $"u{i}", Email = $"u{i}@x.com", Password = "Pass@123", FirstName = "F", LastName = "L", RoleId = role.Id });
        }
        var paged = await _service.GetPagedAsync(1, 2);
        paged.Items.Should().HaveCount(2);
        paged.TotalCount.Should().Be(5);
    }
}
