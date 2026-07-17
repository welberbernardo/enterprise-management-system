using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using EnterpriseManagement.Core.DTOs.Auth;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace EnterpriseManagement.IntegrationTests;

/// <summary>Base class providing an authenticated HttpClient for integration tests.</summary>
public abstract class IntegrationTestBase : IClassFixture<WebApplicationFactory<Program>>
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;

    protected IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    /// <summary>Authenticates and returns a client with a Bearer token attached.</summary>
    protected async Task<HttpClient> GetAuthenticatedClientAsync()
    {
        var response = await Client.PostAsJsonAsync("/api/auth/login", new LoginRequest { Username = "admin", Password = "Admin@123" });
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadFromJsonAsync<JsonElement>();
        var token = content.GetProperty("data").GetProperty("accessToken").GetString();
        var client = Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    protected static async Task<T?> ReadDataAsync<T>(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("data").Deserialize<T>(new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }
}
