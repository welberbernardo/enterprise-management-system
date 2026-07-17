using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Manages system users, roles assignment, and permission lookups.</summary>
public class UsersController : BaseController
{
    private readonly IUserService _service;

    public UsersController(IUserService service) => _service = service;

    [HttpGet]
    [RequirePermission("Users", "View")]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedAsync(page, pageSize, search, cancellationToken);
        return Ok(ApiResponse<PagedResult<UserDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    [RequirePermission("Users", "View")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound(ApiResponse<UserDto>.Fail("User not found.")) : Ok(ApiResponse<UserDto>.Ok(result));
    }

    [HttpPost]
    [RequirePermission("Users", "Manage")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create([FromBody] CreateUserDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<UserDto>.Ok(result, "User created."));
    }

    [HttpPut("{id:int}")]
    [RequirePermission("Users", "Manage")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(int id, [FromBody] UpdateUserDto dto, CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(id, dto, cancellationToken);
        return result is null ? NotFound(ApiResponse<UserDto>.Fail("User not found.")) : Ok(ApiResponse<UserDto>.Ok(result, "User updated."));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission("Users", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken cancellationToken)
    {
        var ok = await _service.DeleteAsync(id, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "User deactivated.")) : NotFound(ApiResponse<bool>.Fail("User not found."));
    }

    [HttpPost("{id:int}/role")]
    [RequirePermission("Users", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignRole(int id, [FromBody] AssignRoleDto dto, CancellationToken cancellationToken)
    {
        var ok = await _service.AssignRoleAsync(id, dto, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Role assigned.")) : NotFound(ApiResponse<bool>.Fail("User not found."));
    }

    [HttpGet("{id:int}/permissions")]
    [RequirePermission("Users", "View")]
    public async Task<ActionResult<ApiResponse<IEnumerable<PermissionDto>>>> GetPermissions(int id, CancellationToken cancellationToken)
    {
        var result = await _service.GetPermissionsAsync(id, cancellationToken);
        return Ok(ApiResponse<IEnumerable<PermissionDto>>.Ok(result));
    }
}
