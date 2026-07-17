using AutoMapper;
using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.UnitTests;
using FluentAssertions;
using Xunit;

namespace EnterpriseManagement.UnitTests;

public class CustomerServiceTests
{
    private readonly TestDbContextFixture _fixture = new();
    private readonly CustomerService _service;

    public CustomerServiceTests()
    {
        var uow = _fixture.CreateUnitOfWork();
        var mapper = new MapperConfiguration(c => c.AddProfile<MappingProfile>()).CreateMapper();
        _service = new CustomerService(uow, mapper);
    }

    [Fact]
    public async Task CreateAsync_AddsCustomer_AndReturnsDto()
    {
        var result = await _service.CreateAsync(new CreateCustomerDto { Code = "C1", Name = "Acme" });
        result.Name.Should().Be("Acme");
        _fixture.Context.Customers.Should().Contain(c => c.Code == "C1");
    }

    [Fact]
    public async Task GetPagedAsync_FiltersBySearch()
    {
        await _service.CreateAsync(new CreateCustomerDto { Code = "A1", Name = "Alpha" });
        await _service.CreateAsync(new CreateCustomerDto { Code = "B1", Name = "Beta" });
        var paged = await _service.GetPagedAsync(1, 10, "Alpha");
        paged.TotalCount.Should().Be(1);
        paged.Items.Should().Contain(c => c.Name == "Alpha");
    }

    [Fact]
    public async Task DeleteAsync_DeactivatesCustomer()
    {
        var created = await _service.CreateAsync(new CreateCustomerDto { Code = "D1", Name = "Delta" });
        var ok = await _service.DeleteAsync(created.Id);
        ok.Should().BeTrue();
        var fromDb = await _fixture.Context.Customers.FindAsync(created.Id);
        fromDb!.IsActive.Should().BeFalse();
    }
}
