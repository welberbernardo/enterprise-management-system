using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Junction entity mapping roles to permissions.</summary>
public class RolePermission : IEntity
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int PermissionId { get; set; }

    public Role? Role { get; set; }
    public Permission? Permission { get; set; }
}
