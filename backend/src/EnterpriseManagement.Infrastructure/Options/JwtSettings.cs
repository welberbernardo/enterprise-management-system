namespace EnterpriseManagement.Infrastructure.Options;

/// <summary>JWT configuration bound from the application settings.</summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "EnterpriseManagement";
    public string Audience { get; set; } = "EnterpriseManagementClients";
    public int AccessTokenExpiryMinutes { get; set; } = 15;
    public int RefreshTokenExpiryDays { get; set; } = 7;
}
