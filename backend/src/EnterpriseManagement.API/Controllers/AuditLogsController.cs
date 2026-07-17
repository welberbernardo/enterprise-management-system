using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Audit;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Provides read-only access to audit logs with search and filters.</summary>
public class AuditLogsController : BaseController
{
    private readonly IAuditLogService _service;

    public AuditLogsController(IAuditLogService service) => _service = service;

    /// <summary>Returns a paged, filtered list of audit log entries.</summary>
    [HttpGet]
    [RequirePermission("Reports", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<AuditLogDto>>>> GetPaged([FromQuery] AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(query, cancellationToken);
        return Ok(ApiResponse<PagedResult<AuditLogDto>>.Ok(result));
    }
}
