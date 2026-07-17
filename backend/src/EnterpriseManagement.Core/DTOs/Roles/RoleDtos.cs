using EnterpriseManagement.Core.DTOs.Permissions;

namespace EnterpriseManagement.Core.DTOs.Roles;

/// <summary>Create payload for a role.</summary>
public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Update payload for a role.</summary>
public class UpdateRoleDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Role summary including its permissions.</summary>
public class RoleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public IEnumerable<PermissionDto> Permissions { get; set; } = new List<PermissionDto>();
}

/// <summary>Payload to assign permissions to a role.</summary>
public class AssignPermissionsDto
{
    public IEnumerable<int> PermissionIds { get; set; } = new List<int>();
}
