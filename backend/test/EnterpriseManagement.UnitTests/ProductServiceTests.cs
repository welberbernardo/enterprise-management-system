using AutoMapper;
using EnterpriseManagement.Application.Mappings;
using EnterpriseManagement.Application.Services;
using EnterpriseManagement.Core.DTOs.Products;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.UnitTests;
using EnterpriseManagement.Infrastructure.Services;
using FluentAssertions;
using Xunit;

namespace EnterpriseManagement.UnitTests;

public class ProductServiceTests
{
    private readonly TestDbContextFixture _fixture = new();
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        var uow = _fixture.CreateUnitOfWork();
        var mapper = new MapperConfiguration(c => c.AddProfile<MappingProfile>()).CreateMapper();
        var audit = new AuditService(_fixture.Context);
        _service = new ProductService(uow, mapper, audit);
        uow.Repository<Category>().AddAsync(new Category { Code = "CAT1", Name = "Cat" }).Wait();
        uow.SaveChangesAsync().Wait();
    }

    [Fact]
    public async Task CreateAsync_AddsProduct()
    {
        var cat = _fixture.Context.Categories.First();
        var result = await _service.CreateAsync(new CreateProductDto { Code = "P1", Name = "Widget", CategoryId = cat.Id, CostPrice = 5, SalePrice = 10, StockQuantity = 100, MinStock = 10 });
        result.Name.Should().Be("Widget");
        _fixture.Context.Products.Should().Contain(p => p.Code == "P1");
    }

    [Fact]
    public async Task AdjustStockAsync_IncreasesStock_AndLogsInventory()
    {
        var cat = _fixture.Context.Categories.First();
        var product = await _service.CreateAsync(new CreateProductDto { Code = "P2", Name = "Thing", CategoryId = cat.Id, CostPrice = 1, SalePrice = 2, StockQuantity = 50, MinStock = 5 });
        var ok = await _service.AdjustStockAsync(new StockAdjustmentDto { ProductId = product.Id, Quantity = 25 });
        ok.Should().BeTrue();
        var fromDb = await _fixture.Context.Products.FindAsync(product.Id);
        fromDb!.StockQuantity.Should().Be(75);
        _fixture.Context.Inventories.Should().Contain(i => i.ProductId == product.Id);
    }

    [Fact]
    public async Task AdjustStockAsync_Negative_ReducesStock_NotBelowZero()
    {
        var cat = _fixture.Context.Categories.First();
        var product = await _service.CreateAsync(new CreateProductDto { Code = "P3", Name = "Item", CategoryId = cat.Id, CostPrice = 1, SalePrice = 2, StockQuantity = 10, MinStock = 1 });
        await _service.AdjustStockAsync(new StockAdjustmentDto { ProductId = product.Id, Quantity = -50 });
        var fromDb = await _fixture.Context.Products.FindAsync(product.Id);
        fromDb!.StockQuantity.Should().Be(0);
    }
}
