using EnterpriseManagement.Core.Interfaces;
using EnterpriseManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Infrastructure.Services;

/// <summary>Persists audit log entries through the application database context.</summary>
public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;

    public AuditService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int? userId, string action, string entityType, string? entityId,
        string? oldValues = null, string? newValues = null, string? ipAddress = null,
        string? userAgent = null, CancellationToken cancellationToken = default)
    {
        var entry = new Core.Entities.AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues,
            NewValues = newValues,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };

        await _context.AuditLogs.AddAsync(entry, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
