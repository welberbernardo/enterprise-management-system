using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Options;
using Microsoft.IdentityModel.Tokens;

namespace EnterpriseManagement.Infrastructure.Services;

/// <summary>Generates and validates JWT access tokens using HMAC-SHA256 signing.</summary>
public class JwtService : IJwtService
{
    private readonly JwtSettings _settings;

    public JwtService(Microsoft.Extensions.Options.IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public string GenerateAccessToken(int userId, string username, IEnumerable<string> roles, IEnumerable<string> permissions)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
        claims.AddRange(permissions.Select(p => new Claim("permission", p)));

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var key = Encoding.UTF8.GetBytes(_settings.Secret);
        var parameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = _settings.Issuer,
            ValidateAudience = true,
            ValidAudience = _settings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        try
        {
            var handler = new JwtSecurityTokenHandler();
            return handler.ValidateToken(token, parameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public int GetTokenExpiryInSeconds(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var exp = jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Exp)?.Value;
            if (exp is null) return 0;
            var expTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp));
            return (int)Math.Max(0, (expTime - DateTimeOffset.UtcNow).TotalSeconds);
        }
        catch
        {
            return 0;
        }
    }
}
