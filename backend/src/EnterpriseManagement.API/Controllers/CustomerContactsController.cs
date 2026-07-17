using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages customer contacts.</summary>
public class CustomerContactsController : BaseController
{
    private readonly ICustomerContactService _service;

    public CustomerContactsController(ICustomerContactService service) => _service = service;

    [HttpGet("customer/{customerId:int}")]
    [RequirePermission("Customers", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<CustomerContactDto>>>> GetByCustomer(int customerId, CancellationToken cancellationToken)
    {
        var result = await _service.GetByCustomerAsync(customerId, cancellationToken);
        return Ok(ApiResponse<IEnumerable<CustomerContactDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Customers", "View")]
    public async Task<ActionResult<ApiResponse<CustomerContactDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<CustomerContactDto>.Fail("Contact not found.")) : Ok(ApiResponse<CustomerContactDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<CustomerContactDto>>> Create([FromBody] CreateCustomerContactDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<CustomerContactDto>.Ok(result, "Contact created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<CustomerContactDto>>> Update(int id, [FromBody] UpdateCustomerContactDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<CustomerContactDto>.Fail("Contact not found.")) : Ok(ApiResponse<CustomerContactDto>.Ok(result, "Contact updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Customers", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Contact deleted.")) : NotFound(ApiResponse<bool>.Fail("Contact not found."));
    }
}
