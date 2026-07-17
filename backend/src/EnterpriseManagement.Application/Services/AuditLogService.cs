using AutoMapper;
using EnterpriseManagement.Core.DTOs.Audit;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements read-only audit log search and filtering.</summary>
public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuditLogService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<AuditLogDto>> GetPagedAsync(AuditLogQueryDto query, CancellationToken cancellationToken = default)
    {
        IQueryable<AuditLog> q = _unitOfWork.Repository<AuditLog>().Query().Include(a => a.User);
        if (!string.IsNullOrWhiteSpace(query.Action))
            q = q.Where(a => a.Action == query.Action);
        if (!string.IsNullOrWhiteSpace(query.EntityType))
            q = q.Where(a => a.EntityType == query.EntityType);
        if (query.UserId.HasValue)
            q = q.Where(a => a.UserId == query.UserId);
        if (query.StartDate.HasValue)
            q = q.Where(a => a.CreatedAt >= query.StartDate.Value);
        if (query.EndDate.HasValue)
            q = q.Where(a => a.CreatedAt <= query.EndDate.Value);

        var total = await q.CountAsync(cancellationToken);
        var items = await q.OrderByDescending(a => a.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>
        {
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<AuditLogDto>>(items)
        };
    }
}
