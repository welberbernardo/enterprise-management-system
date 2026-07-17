using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Products;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages products and stock adjustments.</summary>
public class ProductsController : BaseController
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    [HttpGet]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, [FromQuery] int? categoryId = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, categoryId, cancellationToken);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<ProductDto>.Fail("Product not found.")) : Ok(ApiResponse<ProductDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<ProductDto>.Ok(result, "Product created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(int id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<ProductDto>.Fail("Product not found.")) : Ok(ApiResponse<ProductDto>.Ok(result, "Product updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Product deactivated.")) : NotFound(ApiResponse<bool>.Fail("Product not found."));
    }

    [HttpPost("stock/adjust")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> AdjustStock([FromBody] StockAdjustmentDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.AdjustStockAsync(dto, CurrentUserId, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Stock adjusted.")) : NotFound(ApiResponse<bool>.Fail("Product not found."));
    }
}
