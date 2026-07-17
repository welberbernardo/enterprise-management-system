using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages accounts payable and payment tracking.</summary>
public class AccountsPayableController : BaseController
{
    private readonly IAccountPayableService _service;

    public AccountsPayableController(IAccountPayableService service) => _service = service;

    [HttpGet]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AccountPayableDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<AccountPayableDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<AccountPayableDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<AccountPayableDto>.Fail("Record not found.")) : Ok(ApiResponse<AccountPayableDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<AccountPayableDto>>> Create([FromBody] CreateAccountPayableDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AccountPayableDto>.Ok(result, "Created."));
    }

    [HttpPost("{id:int}/payment")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> RecordPayment(int id, [FromBody] PayablePaymentDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.RecordPaymentAsync(id, dto, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Payment recorded.")) : NotFound(ApiResponse<bool>.Fail("Record not found."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Deleted.")) : NotFound(ApiResponse<bool>.Fail("Record not found."));
    }
}
