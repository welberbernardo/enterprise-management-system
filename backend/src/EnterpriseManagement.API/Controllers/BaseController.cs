using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Base controller exposing the current authenticated user identifier.</summary>
[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    /// <summary>Gets the current user's identifier from the claims, or null.</summary>
    protected int? CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            return claim is null ? null : int.Parse(claim.Value);
        }
    }
}
