using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages customers and their contacts.</summary>
public class CustomersController : BaseController
{
    private readonly ICustomerService _service;

    public CustomersController(ICustomerService service) => _service = service;

    [HttpGet]
    [RequirePermission("Customers", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<CustomerDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResult<CustomerDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Customers", "View")]
    public async Task<ActionResult<ApiResponse<CustomerDetailDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<CustomerDetailDto>.Fail("Customer not found.")) : Ok(ApiResponse<CustomerDetailDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> Create([FromBody] CreateCustomerDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CustomerDto>.Ok(result, "Customer created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<CustomerDto>>> Update(int id, [FromBody] UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<CustomerDto>.Fail("Customer not found.")) : Ok(ApiResponse<CustomerDto>.Ok(result, "Customer updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Customer deactivated.")) : NotFound(ApiResponse<bool>.Fail("Customer not found."));
    }
}
