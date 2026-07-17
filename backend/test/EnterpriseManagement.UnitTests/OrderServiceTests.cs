using AutoMapper;
using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.UnitTests;
using EnterpriseManagement.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace EnterpriseManagement.UnitTests;

public class OrderServiceTests
{
    private readonly TestDbContextFixture _fixture = new();
    private readonly OrderService _service;

    public OrderServiceTests()
    {
        var uow = _fixture.CreateUnitOfWork();
        var mapper = new MapperConfiguration(c => c.AddProfile<MappingProfile>()).CreateMapper();
        var audit = new AuditService(_fixture.Context);
        _service = new OrderService(uow, mapper, audit);

        uow.Repository<Customer>().AddAsync(new Customer { Code = "C1", Name = "Acme" }).Wait();
        uow.Repository<Category>().AddAsync(new Category { Code = "CAT1", Name = "Cat" }).Wait();
        uow.SaveChangesAsync().Wait();
        uow.Repository<Product>().AddAsync(new Product { Code = "P1", Name = "Widget", CategoryId = _fixture.Context.Categories.First().Id, SalePrice = 10, CostPrice = 5 }).Wait();
        uow.SaveChangesAsync().Wait();
    }

    [Fact]
    public async Task CreateAsync_CreatesOrder_WithItems_AndTotal()
    {
        var customer = _fixture.Context.Customers.First();
        var product = _fixture.Context.Products.First();
        var dto = new CreateOrderDto
        {
            CustomerId = customer.Id,
            Items = new[] { new CreateOrderItemDto { ProductId = product.Id, Quantity = 2, UnitPrice = 10, Discount = 0 } }
        };
        var result = await _service.CreateAsync(dto);
        result.Items.Should().HaveCount(1);
        result.TotalAmount.Should().Be(20);
        _fixture.Context.Orders.Should().Contain(o => o.OrderNumber == result.OrderNumber);
    }

    [Fact]
    public async Task ChangeStatusAsync_UpdatesStatus()
    {
        var customer = _fixture.Context.Customers.First();
        var product = _fixture.Context.Products.First();
        var order = await _service.CreateAsync(new CreateOrderDto
        {
            CustomerId = customer.Id,
            Items = new[] { new CreateOrderItemDto { ProductId = product.Id, Quantity = 1, UnitPrice = 5, Discount = 0 } }
        });
        var ok = await _service.ChangeStatusAsync(order.Id, new ChangeOrderStatusDto { Status = EnterpriseManagement.Core.Entities.OrderStatus.Shipped });
        ok.Should().BeTrue();
        var fromDb = await _fixture.Context.Orders.FindAsync(order.Id);
        fromDb!.Status.Should().Be(EnterpriseManagement.Core.Entities.OrderStatus.Shipped);
    }
}
