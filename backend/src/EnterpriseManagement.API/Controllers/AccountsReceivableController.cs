using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages accounts receivable and payment tracking.</summary>
public class AccountsReceivableController : BaseController
{
    private readonly IAccountReceivableService _service;

    public AccountsReceivableController(IAccountReceivableService service) => _service = service;

    [HttpGet]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AccountReceivableDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<AccountReceivableDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<AccountReceivableDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<AccountReceivableDto>.Fail("Record not found.")) : Ok(ApiResponse<AccountReceivableDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<AccountReceivableDto>>> Create([FromBody] CreateAccountReceivableDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AccountReceivableDto>.Ok(result, "Created."));
    }

    [HttpPost("{id:int}/payment")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> RecordPayment(int id, [FromBody] ReceivablePaymentDto dto, CancellationToken cancellationToken)
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
