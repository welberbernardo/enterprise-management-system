using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Invoices;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages invoices, status changes, and PDF generation.</summary>
public class InvoicesController : BaseController
{
    private readonly IInvoiceService _service;

    public InvoicesController(IInvoiceService service) => _service = service;

    [HttpGet]
    [RequirePermission("Orders", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<InvoiceDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<InvoiceDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Orders", "View")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<InvoiceDto>.Fail("Invoice not found.")) : Ok(ApiResponse<InvoiceDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> Create([FromBody] CreateInvoiceDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<InvoiceDto>.Ok(result, "Invoice created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> Update(int id, [FromBody] UpdateInvoiceDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<InvoiceDto>.Fail("Invoice not found.")) : Ok(ApiResponse<InvoiceDto>.Ok(result, "Invoice updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Invoice cancelled.")) : NotFound(ApiResponse<bool>.Fail("Invoice not found."));
    }

    [HttpPut("{id:int}/status")]
    [RequirePermission("Orders", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangeStatus(int id, [FromBody] ChangeInvoiceStatusDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.ChangeStatusAsync(id, dto, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Status updated.")) : NotFound(ApiResponse<bool>.Fail("Invoice not found."));
    }

    /// <summary>Generates a PDF for the given invoice.</summary>
    [HttpGet("{id:int}/pdf")]
    [RequirePermission("Orders", "View")]
    public async Task<IActionResult> GeneratePdf(int id, CancellationToken cancellationToken)
    {
        var pdf = await _service.GeneratePdfAsync(id, cancellationToken);
        return File(pdf, "application/pdf", $"invoice-{id}.pdf");
    }
}
