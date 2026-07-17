using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Reports;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Generates business reports across multiple domains.</summary>
public class ReportsController : BaseController
{
    private readonly IReportService _service;

    public ReportsController(IReportService service) => _service = service;

    /// <summary>Sales report grouped by status.</summary>
    [HttpGet("sales")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReportRowDto>>>> Sales([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetSalesReportAsync(new ReportQueryDto { StartDate = startDate, EndDate = endDate }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ReportRowDto>>.Ok(result));
    }

    /// <summary>Inventory valuation report.</summary>
    [HttpGet("inventory")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReportRowDto>>>> Inventory(CancellationToken cancellationToken)
    {
        var result = await _service.GetInventoryReportAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<ReportRowDto>>.Ok(result));
    }

    /// <summary>Top customers report.</summary>
    [HttpGet("customers")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReportRowDto>>>> Customers(CancellationToken cancellationToken)
    {
        var result = await _service.GetCustomersReportAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<ReportRowDto>>.Ok(result));
    }

    /// <summary>Top products report.</summary>
    [HttpGet("products")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReportRowDto>>>> Products(CancellationToken cancellationToken)
    {
        var result = await _service.GetProductsReportAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<ReportRowDto>>.Ok(result));
    }

    /// <summary>Financial summary report.</summary>
    [HttpGet("financial")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ReportRowDto>>>> Financial([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetFinancialReportAsync(new ReportQueryDto { StartDate = startDate, EndDate = endDate }, cancellationToken);
        return Ok(ApiResponse<IEnumerable<ReportRowDto>>.Ok(result));
    }
}
