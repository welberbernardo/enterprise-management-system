using System.Net;
using System.Net.Http.Json;
using EnterpriseManagement.Core.DTOs.Customers;
using Microsoft.AspNetCore.Mvc.Testing;
using EnterpriseManagement.Core.DTOs.Common;
using Xunit;

namespace EnterpriseManagement.IntegrationTests;

/// <summary>Integration tests for the customers endpoints.</summary>
public class CustomersControllerTests : IntegrationTestBase
{
    public CustomersControllerTests(WebApplicationFactory<Program> factory) : base(factory) { }

    [Fact]
    public async Task GetAll_RequiresAuthentication_ReturnsOk()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync("/api/customers?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadDataAsync<PagedResult<CustomerDto>>(response);
        Assert.NotNull(body);
        Assert.True(body!.TotalCount >= 1);
    }

    [Fact]
    public async Task GetAll_WithoutToken_ReturnsUnauthorized()
    {
        var response = await Client.GetAsync("/api/customers");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_Then_GetById_ReturnsCreatedCustomer()
    {
        var client = await GetAuthenticatedClientAsync();
        var create = await client.PostAsJsonAsync("/api/customers", new CreateCustomerDto
        {
            Code = "CUST_" + Guid.NewGuid().ToString("N")[..8],
            Name = "Integration Customer"
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await ReadDataAsync<CustomerDto>(create);
        Assert.NotNull(created);

        var get = await client.GetAsync($"/api/customers/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
    }

    [Fact]
    public async Task Search_FiltersByName()
    {
        var client = await GetAuthenticatedClientAsync();
        var response = await client.GetAsync("/api/customers?search=Acme");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await ReadDataAsync<PagedResult<CustomerDto>>(response);
        Assert.Contains(body!.Items, c => c.Name.Contains("Acme"));
    }
}
