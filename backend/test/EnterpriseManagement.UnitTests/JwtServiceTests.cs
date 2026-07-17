using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Infrastructure.Data;
using EnterpriseManagement.Infrastructure.Options;
using EnterpriseManagement.Infrastructure.Repositories;
using EnterpriseManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using Xunit;

namespace EnterpriseManagement.UnitTests;

/// <summary>Tests for the JWT token service.</summary>
public class JwtServiceTests
{
    private readonly JwtService _service;

    public JwtServiceTests()
    {
        var settings = Options.Create(new JwtSettings
        {
            Secret = "SuperSecretKeyForJwtSigningThatIsAtLeast32BytesLong!!",
            Issuer = "Test",
            Audience = "TestClients",
            AccessTokenExpiryMinutes = 15
        });
        _service = new JwtService(settings);
    }

    [Fact]
    public void GenerateAccessToken_ReturnsValidToken_WithClaims()
    {
        var token = _service.GenerateAccessToken(1, "admin", new[] { "Administrator" }, new[] { "Users.View" });

        Assert.False(string.IsNullOrEmpty(token));
        var principal = _service.ValidateToken(token);
        Assert.NotNull(principal);
        Assert.Equal("1", principal!.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        Assert.Equal("admin", principal.FindFirst(System.Security.Claims.ClaimTypes.Name)!.Value);
        Assert.Contains(principal.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == "Administrator");
        Assert.Contains(principal.Claims, c => c.Type == "permission" && c.Value == "Users.View");
    }

    [Fact]
    public void ValidateToken_ReturnsNull_ForInvalidToken()
    {
        var principal = _service.ValidateToken("not-a-real-token");
        Assert.Null(principal);
    }

    [Fact]
    public void GetTokenExpiryInSeconds_IsPositive()
    {
        var token = _service.GenerateAccessToken(1, "admin", new[] { "Administrator" }, new[] { "Users.View" });
        var expiry = _service.GetTokenExpiryInSeconds(token);
        Assert.True(expiry > 0 && expiry <= 15 * 60);
    }
}
