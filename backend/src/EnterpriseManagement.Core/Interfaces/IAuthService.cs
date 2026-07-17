using EnterpriseManagement.Core.DTOs.Auth;
using EnterpriseManagement.Core.DTOs.Users;

namespace EnterpriseManagement.Core.Interfaces;

/// <summary>Authentication service contract.</summary>
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default);
    Task<LoginResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse?> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);
    Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default);
    Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default);
    Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateUserDto request, CancellationToken cancellationToken = default);
}
