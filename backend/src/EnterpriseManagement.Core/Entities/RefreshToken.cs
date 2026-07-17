using EnterpriseManagement.Core.Interfaces;

namespace EnterpriseManagement.Core.Entities;

/// <summary>Represents a refresh token issued for a user session.</summary>
public class RefreshToken : IEntity
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
