using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Core.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages security roles and their permission assignments.</summary>
public class RolesController : BaseController
{
    private readonly IRoleService _service;

    public RolesController(IRoleService service) => _service = service;

    [HttpGet]
    [RequirePermission("Roles", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RoleDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse<IEnumerable<RoleDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Roles", "View")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<RoleDto>.Fail("Role not found.")) : Ok(ApiResponse<RoleDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> Create([FromBody] CreateRoleDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<RoleDto>.Ok(result, "Role created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> Update(int id, [FromBody] UpdateRoleDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<RoleDto>.Fail("Role not found.")) : Ok(ApiResponse<RoleDto>.Ok(result, "Role updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Role deleted.")) : NotFound(ApiResponse<bool>.Fail("Role not found."));
    }

    [HttpPost("{id:int}/permissions")]
    [RequirePermission("Roles", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPermissions(int id, [FromBody] AssignPermissionsDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.AssignPermissionsAsync(id, dto, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Permissions assigned.")) : NotFound(ApiResponse<bool>.Fail("Role not found."));
    }

    [HttpGet("{id:int}/permissions")]
    [RequirePermission("Roles", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PermissionDto>>>> GetPermissions(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetPermissionsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<PermissionDto>>.Ok(result));
    }
}
