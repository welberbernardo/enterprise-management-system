namespace EnterpriseManagement.Core.DTOs.Audit;

/// <summary>Audit log entry summary.</summary>
public class AuditLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Audit log search filters.</summary>
public class AuditLogQueryDto
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public int? UserId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
