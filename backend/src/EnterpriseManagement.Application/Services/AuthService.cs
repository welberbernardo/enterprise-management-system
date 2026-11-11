using System.Security.Cryptography;
using AutoMapper;
using BCrypt.Net;
using EnterpriseManagement.Core.DTOs.Auth;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Data;
using EnterpriseManagement.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements authentication, token issuance, and profile management.</summary>
public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;
    private readonly IAuditService _auditService;
    private readonly IMapper _mapper;
    private readonly JwtSettings _jwtSettings;

    public AuthService(IUnitOfWork unitOfWork, IJwtService jwtService, IEmailService emailService,
        IAuditService auditService, IMapper mapper, IOptions<JwtSettings> jwtSettings)
    {
        _unitOfWork = unitOfWork;
        _jwtService = jwtService;
        _emailService = emailService;
        _auditService = auditService;
        _mapper = mapper;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, string? ipAddress = null, string? userAgent = null, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(u => u.Username == request.Username, cancellationToken);
        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return await BuildLoginResponseAsync(user, ipAddress, userAgent, cancellationToken);
    }

    public async Task<LoginResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<User>().AnyAsync(u => u.Username == request.Username || u.Email == request.Email, cancellationToken);
        if (exists) return null;

        var role = await _unitOfWork.Repository<Role>().GetByIdAsync(request.RoleId, cancellationToken);
        if (role is null || !role.IsActive) return null;

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            RoleId = request.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<User>().AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await BuildLoginResponseAsync(user, null, null, cancellationToken);
    }

    public async Task<LoginResponse?> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var repo = _unitOfWork.Repository<RefreshToken>();
        var token = await repo.FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);
        if (token is null || token.IsRevoked || token.ExpiresAt < DateTime.UtcNow)
            return null;

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(token.UserId, cancellationToken);
        if (user is null || !user.IsActive) return null;

        // A refresh token is single-use. Revoke it before issuing a replacement.
        // Concurrent refresh requests should additionally be protected by a database concurrency constraint.
        token.IsRevoked = true;
        repo.Update(token);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(user.Id, "RefreshToken", nameof(RefreshToken), token.Id.ToString(), ipAddress: null, cancellationToken: cancellationToken);
        return await BuildLoginResponseAsync(user, null, null, cancellationToken);
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var repo = _unitOfWork.Repository<RefreshToken>();
        var token = await repo.FirstOrDefaultAsync(t => t.Token == refreshToken, cancellationToken);
        if (token is null) return false;
        token.IsRevoked = true;
        repo.Update(token);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        // No persisted token, expiry, redemption endpoint, or verified email delivery exists yet.
        // Fail closed instead of generating unusable recovery credentials.
        return Task.FromResult(false);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId, cancellationToken);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return false;

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 12 || request.NewPassword.Length > 128 ||
            request.NewPassword != request.ConfirmPassword ||
            BCrypt.Net.BCrypt.Verify(request.NewPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        // Revoke outstanding refresh tokens after a password change.
        var refreshTokens = await _unitOfWork.Repository<RefreshToken>().Query()
            .Where(t => t.UserId == userId && !t.IsRevoked)
            .ToListAsync(cancellationToken);
        foreach (var token in refreshTokens)
        {
            token.IsRevoked = true;
            _unitOfWork.Repository<RefreshToken>().Update(token);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId, cancellationToken);
        if (user is null) return null;

        var dto = _mapper.Map<UserProfileDto>(user);
        dto.Permissions = await GetUserPermissionsAsync(user, cancellationToken);
        return dto;
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateUserDto request, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId, cancellationToken);
        if (user is null) return null;

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;
        // Self-service profile changes must never modify roles or account status.
        // Role and activation changes belong to privileged user-management operations.
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetProfileAsync(userId, cancellationToken);
    }

    private async Task<List<string>> GetUserPermissionsAsync(User user, CancellationToken cancellationToken)
    {
        var role = await _unitOfWork.Repository<Role>().FirstOrDefaultAsync(r => r.Id == user.RoleId, cancellationToken);
        if (role is null) return new List<string>();

        var rolePerms = await _unitOfWork.Repository<RolePermission>().Query()
            .Where(rp => rp.RoleId == role.Id)
            .ToListAsync(cancellationToken);

        var permissionIds = rolePerms.Select(rp => rp.PermissionId).ToList();
        if (!permissionIds.Any()) return new List<string>();

        var permissions = await _unitOfWork.Repository<Permission>().Query()
            .Where(p => permissionIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        return permissions.Select(p => $"{p.Module}.{p.Action}").ToList();
    }

    private async Task<LoginResponse> BuildLoginResponseAsync(User user, string? ipAddress, string? userAgent, CancellationToken cancellationToken)
    {
        var permissions = await GetUserPermissionsAsync(user, cancellationToken);
        var roles = user.Role != null ? new List<string> { user.Role.Name } : new List<string>();

        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Username, roles, permissions);
        var refreshTokenStr = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenStr,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<RefreshToken>().AddAsync(refreshToken, cancellationToken);

        user.LastLoginAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditService.LogAsync(user.Id, "Login", nameof(User), user.Id.ToString(), ipAddress: ipAddress, userAgent: userAgent, cancellationToken: cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenStr,
            AccessTokenExpiry = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes),
            UserId = user.Id,
            Username = user.Username,
            FullName = $"{user.FirstName} {user.LastName}",
            Role = user.Role?.Name ?? string.Empty,
            Permissions = permissions
        };
    }
}
