namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Generates and validates JSON Web Tokens for authenticated principals.
/// </summary>
public interface IJwtService
{
    /// <summary>Creates an access token for the given user and roles/permissions.</summary>
    string GenerateAccessToken(int userId, string username, IEnumerable<string> roles, IEnumerable<string> permissions);

    /// <summary>Validates a token and returns its principal, or null when invalid.</summary>
    System.Security.Claims.ClaimsPrincipal? ValidateToken(string token);

    /// <summary>Returns the remaining lifetime of the token in seconds, or 0.</summary>
    int GetTokenExpiryInSeconds(string token);
}
