using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements permission management and search.</summary>
public class PermissionService : IPermissionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PermissionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<PermissionDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Permission>().Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(s) || p.Module.ToLower().Contains(s) || p.Action.ToLower().Contains(s));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(p => p.Module).ThenBy(p => p.Action)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<PermissionDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<PermissionDto>>(items)
        };
    }

    public async Task<PermissionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var perm = await _unitOfWork.Repository<Permission>().GetByIdAsync(id, cancellationToken);
        return perm is null ? null : _mapper.Map<PermissionDto>(perm);
    }

    public async Task<PermissionDto> CreateAsync(CreatePermissionDto dto, CancellationToken cancellationToken = default)
    {
        var perm = _mapper.Map<Permission>(dto);
        perm.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Permission>().AddAsync(perm, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<PermissionDto>(perm);
    }

    public async Task<PermissionDto?> UpdateAsync(int id, UpdatePermissionDto dto, CancellationToken cancellationToken = default)
    {
        var perm = await _unitOfWork.Repository<Permission>().GetByIdAsync(id, cancellationToken);
        if (perm is null) return null;
        _mapper.Map(dto, perm);
        _unitOfWork.Repository<Permission>().Update(perm);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<PermissionDto>(perm);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var perm = await _unitOfWork.Repository<Permission>().GetByIdAsync(id, cancellationToken);
        if (perm is null) return false;
        _unitOfWork.Repository<Permission>().Remove(perm);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
