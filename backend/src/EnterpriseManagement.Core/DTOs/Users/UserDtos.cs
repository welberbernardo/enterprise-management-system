namespace EnterpriseManagement.Core.DTOs.Users;

/// <summary>Create payload for a user.</summary>
public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int RoleId { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Update payload for a user.</summary>
public class UpdateUserDto
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int RoleId { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>Profile information for the current user.</summary>
public class UserProfileDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public IEnumerable<string> Permissions { get; set; } = new List<string>();
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>Public summary of a user.</summary>
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}

/// <summary>Payload to assign a role to a user.</summary>
public class AssignRoleDto
{
    public int RoleId { get; set; }
}
