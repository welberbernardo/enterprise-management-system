using System.Net;
using System.Net.Http.Json;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.DTOs.Users;
using Microsoft.AspNetCore.Mvc.Testing;
using EnterpriseManagement.Core.DTOs.Common;
using Xunit;

namespace EnterpriseManagement.IntegrationTests;

/// <summary>Integration tests for the users endpoints.</summary>
public class UsersControllerTests : IntegrationTestBase
{
    public UsersControllerTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task GetAll_RequiresAuthentication_ReturnsOkWithToken()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync("/api/users?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadDataAsync<PagedResult<UserDto>>(response);
        Assert.NotNull(body);
        Assert.True(body!.TotalCount >= 1);
    }

    [Fact]
    public async Task GetAll_WithoutToken_ReturnsUnauthorized()
    {
        var response = await Client.GetAsync("/api/users");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_Then_GetById_ReturnsCreatedUser()
    {
        var client = await GetAuthenticatedClientAsync();
        var role = await GetFirstRoleIdAsync(client);
        var create = await client.PostAsJsonAsync("/api/users", new CreateUserDto
        {
            Username = "testuser_" + Guid.NewGuid().ToString("N")[..8],
            Email = $"tu_{Guid.NewGuid():N}@x.com",
            Password = "Pass@123",
            FirstName = "Test",
            LastName = "User",
            RoleId = role
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await ReadDataAsync<UserDto>(create);
        Assert.NotNull(created);

        var get = await client.GetAsync($"/api/users/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
    }

    private async Task<int> GetFirstRoleIdAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/roles");
        var roles = await ReadDataAsync<IEnumerable<RoleDto>>(response);
        return roles!.First().Id;
    }
}
