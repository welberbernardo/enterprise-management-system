namespace EnterpriseManagement.Core.Interfaces;

/// <summary>
/// Records audit events for user actions across the system.
/// </summary>
public interface IAuditService
{
    /// <summary>Records an audit entry asynchronously.</summary>
    Task LogAsync(int? userId, string action, string entityType, string? entityId,
        string? oldValues = null, string? newValues = null, string? ipAddress = null,
        string? userAgent = null, CancellationToken cancellationToken = default);
}
