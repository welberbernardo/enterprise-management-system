using Microsoft.AspNetCore.Authorization;

namespace EnterpriseManagement.API.Attributes;

/// <summary>Authorizes a request based on a required permission claim (format Module.Action).</summary>
public class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(string module, string action)
    {
        Policy = $"Permission:{module}.{action}";
    }
}

/// <summary>Authorizes a request based on a required role.</summary>
public class RequireRoleAttribute : AuthorizeAttribute
{
    public RequireRoleAttribute(string role)
    {
        Roles = role;
    }
}
