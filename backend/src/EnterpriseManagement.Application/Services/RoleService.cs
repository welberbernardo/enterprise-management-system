using AutoMapper;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements role and permission management.</summary>
public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RoleService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RoleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _unitOfWork.Repository<Role>().Query()
            .Include(r => r.RolePermissions!).ThenInclude(rp => rp.Permission)
            .OrderBy(r => r.Name).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<RoleDto>>(roles);
    }

    public async Task<RoleDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.Repository<Role>().Query()
            .Include(r => r.RolePermissions!).ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        return role is null ? null : _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var role = _mapper.Map<Role>(dto);
        role.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Role>().AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<RoleDto>(role);
    }

    public async Task<RoleDto?> UpdateAsync(int id, UpdateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id, cancellationToken);
        if (role is null) return null;
        _mapper.Map(dto, role);
        _unitOfWork.Repository<Role>().Update(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<RoleDto>(role);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.Repository<Role>().GetByIdAsync(id, cancellationToken);
        if (role is null) return false;
        _unitOfWork.Repository<Role>().Remove(role);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> AssignPermissionsAsync(int roleId, AssignPermissionsDto dto, CancellationToken cancellationToken = default)
    {
        var role = await _unitOfWork.Repository<Role>().GetByIdAsync(roleId, cancellationToken);
        if (role is null) return false;

        var existing = await _unitOfWork.Repository<RolePermission>().Query().Where(rp => rp.RoleId == roleId).ToListAsync(cancellationToken);
        _unitOfWork.Repository<RolePermission>().RemoveRange(existing);

        foreach (var permId in dto.PermissionIds.Distinct())
        {
            await _unitOfWork.Repository<RolePermission>().AddAsync(new RolePermission { RoleId = roleId, PermissionId = permId }, cancellationToken);
        }
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int roleId, CancellationToken cancellationToken = default)
    {
        var rolePerms = await _unitOfWork.Repository<RolePermission>().Query().Where(rp => rp.RoleId == roleId).ToListAsync(cancellationToken);
        var ids = rolePerms.Select(rp => rp.PermissionId).ToList();
        var perms = await _unitOfWork.Repository<Permission>().Query().Where(p => ids.Contains(p.Id)).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<PermissionDto>>(perms);
    }
}
