using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Reports;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Exposes dashboard statistics, charts, and recent activity.</summary>
public class DashboardController : BaseController
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    /// <summary>Returns key performance indicators.</summary>
    [HttpGet("stats")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats(CancellationToken cancellationToken)
    {
        var result = await _service.GetStatsAsync(cancellationToken);
        return Ok(ApiResponse<DashboardStatsDto>.Ok(result));
    }

    /// <summary>Returns aggregated dashboard data.</summary>
    [HttpGet]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<DashboardDataDto>>> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _service.GetDashboardAsync(cancellationToken);
        return Ok(ApiResponse<DashboardDataDto>.Ok(result));
    }

    /// <summary>Returns sales chart data.</summary>
    [HttpGet("charts")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<SalesChartDto>>> GetCharts(CancellationToken cancellationToken)
    {
        var result = await _service.GetSalesChartAsync(cancellationToken);
        return Ok(ApiResponse<SalesChartDto>.Ok(result));
    }

    /// <summary>Returns recent activity entries.</summary>
    [HttpGet("activity")]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RecentActivityDto>>>> GetActivity([FromQuery] int count = 10, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetRecentActivityAsync(count, cancellationToken);
        return Ok(ApiResponse<IEnumerable<RecentActivityDto>>.Ok(result));
    }
}
