using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages system permissions.</summary>
public class PermissionsController : BaseController
{
    private readonly IPermissionService _service;

    public PermissionsController(IPermissionService service) => _service = service;

    [HttpGet]
    [RequirePermission("Roles", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<PermissionDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResult<PermissionDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Roles", "View")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<PermissionDto>.Fail("Permission not found.")) : Ok(ApiResponse<PermissionDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> Create([FromBody] CreatePermissionDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<PermissionDto>.Ok(result, "Permission created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<PermissionDto>>> Update(int id, [FromBody] UpdatePermissionDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<PermissionDto>.Fail("Permission not found.")) : Ok(ApiResponse<PermissionDto>.Ok(result, "Permission updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Permission deleted.")) : NotFound(ApiResponse<bool>.Fail("Permission not found."));
    }
}
