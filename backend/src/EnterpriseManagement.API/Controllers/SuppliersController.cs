using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Suppliers;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages suppliers.</summary>
public class SuppliersController : BaseController
{
    private readonly ISupplierService _service;

    public SuppliersController(ISupplierService service) => _service = service;

    [HttpGet]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<SupplierDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResult<SupplierDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Products", "View")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<SupplierDto>.Fail("Supplier not found.")) : Ok(ApiResponse<SupplierDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> Create([FromBody] CreateSupplierDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SupplierDto>.Ok(result, "Supplier created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> Update(int id, [FromBody] UpdateSupplierDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<SupplierDto>.Fail("Supplier not found.")) : Ok(ApiResponse<SupplierDto>.Ok(result, "Supplier updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Products", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Supplier deactivated.")) : NotFound(ApiResponse<bool>.Fail("Supplier not found."));
    }
}
