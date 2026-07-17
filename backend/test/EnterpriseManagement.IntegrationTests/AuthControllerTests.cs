using System.Net;
using System.Net.Http.Json;
using EnterpriseManagement.Core.DTOs.Auth;
using EnterpriseManagement.Core.DTOs.Users;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace EnterpriseManagement.IntegrationTests;

/// <summary>Integration tests for the authentication endpoints.</summary>
public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk_AndTokens()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest { Username = "admin", Password = "Admin@123" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadDataAsync<LoginResponse>(response);
        Assert.False(string.IsNullOrEmpty(body!.AccessToken));
        Assert.False(string.IsNullOrEmpty(body.RefreshToken));
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest { Username = "admin", Password = "wrong" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Profile_WithoutToken_ReturnsUnauthorized()
    {
        var response = await Client.GetAsync("/api/auth/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Profile_WithToken_ReturnsProfile()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync("/api/auth/profile");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadDataAsync<UserProfileDto>(response);
        Assert.Equal("admin", body!.Username);
    }
}
