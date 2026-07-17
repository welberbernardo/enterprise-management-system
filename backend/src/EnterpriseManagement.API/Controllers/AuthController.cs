using EnterpriseManagement.API.Attributes;
using EnterpriseManagement.Core.DTOs.Auth;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnterpriseManagement.API.Controllers;

/// <summary>Handles authentication, token refresh, and profile operations.</summary>
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    /// <summary>Authenticates a user and returns a token pair.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers.UserAgent.ToString();
        var result = await _authService.LoginAsync(request, ip, ua, cancellationToken);
        return result is null
            ? Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid credentials."))
            : Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    /// <summary>Registers a new user.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return result is null
            ? BadRequest(ApiResponse<LoginResponse>.Fail("Username or email already exists, or role invalid."))
            : Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    /// <summary>Exchanges a refresh token for a new token pair.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await _authService.RefreshTokenAsync(request, cancellationToken);
        return result is null
            ? Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid refresh token."))
            : Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    /// <summary>Revokes a refresh token.</summary>
    [HttpPost("revoke")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> Revoke([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var ok = await _authService.RevokeTokenAsync(request.RefreshToken, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Token revoked.")) : BadRequest(ApiResponse<bool>.Fail("Token not found."));
    }

    /// <summary>Initiates a password reset for the given email.</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ForgotPasswordAsync(request, cancellationToken);
        return Ok(ApiResponse<bool>.Ok(true, "If the email exists, a reset link was sent."));
    }

    /// <summary>Changes the current user's password.</summary>
    [HttpPost("change-password")]
    [RequirePermission("Users", "Manage")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        if (CurrentUserId is null) return Unauthorized();
        var ok = await _authService.ChangePasswordAsync(CurrentUserId.Value, request, cancellationToken);
        return ok ? Ok(ApiResponse<bool>.Ok(true, "Password changed.")) : BadRequest(ApiResponse<bool>.Fail("Current password is incorrect."));
    }

    /// <summary>Returns the current user's profile.</summary>
    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile(CancellationToken cancellationToken)
    {
        if (CurrentUserId is null) return Unauthorized();
        var profile = await _authService.GetProfileAsync(CurrentUserId.Value, cancellationToken);
        return profile is null ? NotFound(ApiResponse<UserProfileDto>.Fail("Profile not found.")) : Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }

    /// <summary>Updates the current user's profile.</summary>
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateProfile([FromBody] UpdateUserDto request, CancellationToken cancellationToken)
    {
        if (CurrentUserId is null) return Unauthorized();
        var profile = await _authService.UpdateProfileAsync(CurrentUserId.Value, request, cancellationToken);
        return profile is null ? NotFound(ApiResponse<UserProfileDto>.Fail("Profile not found.")) : Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }
}
