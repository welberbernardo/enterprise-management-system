using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Permissions;
using EnterpriseManagement.Core.DTOs.Roles;
using EnterpriseManagement.Core.DTOs.Users;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements user management operations.</summary>
public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<UserDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<User>().Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(u => u.Username.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || (u.FirstName + " " + u.LastName).ToLower().Contains(s));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Include(u => u.Role)
            .OrderBy(u => u.Username)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<UserDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<UserDto>>(items)
        };
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().Query().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        return user is null ? null : _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<User>().AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email, cancellationToken);
        if (exists) throw new InvalidOperationException("Username or email already exists.");

        var user = _mapper.Map<User>(dto);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.CreatedAt = DateTime.UtcNow;
        user.IsActive = dto.IsActive;
        await _unitOfWork.Repository<User>().AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto?> UpdateAsync(int id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id, cancellationToken);
        if (user is null) return null;
        _mapper.Map(dto, user);
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id, cancellationToken);
        if (user is null) return false;
        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> AssignRoleAsync(int userId, AssignRoleDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId, cancellationToken);
        if (user is null) return false;
        user.RoleId = dto.RoleId;
        user.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<User>().Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IEnumerable<PermissionDto>> GetPermissionsAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _unitOfWork.Repository<User>().Query().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null) return Enumerable.Empty<PermissionDto>();

        var rolePerms = await _unitOfWork.Repository<RolePermission>().Query().Where(rp => rp.RoleId == user.RoleId).ToListAsync(cancellationToken);
        var ids = rolePerms.Select(rp => rp.PermissionId).ToList();
        var perms = await _unitOfWork.Repository<Permission>().Query().Where(p => ids.Contains(p.Id)).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<PermissionDto>>(perms);
    }
}
