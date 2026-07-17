using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Suppliers;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements supplier management and search.</summary>
public class SupplierService : ISupplierService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SupplierService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<SupplierDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Supplier>().Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || c.Code.ToLower().Contains(s) || (c.Email != null && c.Email.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(c => c.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<SupplierDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<SupplierDto>>(items)
        };
    }

    public async Task<SupplierDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(id, cancellationToken);
        return supplier is null ? null : _mapper.Map<SupplierDto>(supplier);
    }

    public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<Supplier>().AnyAsync(c => c.Code == dto.Code, cancellationToken);
        if (exists) throw new InvalidOperationException("Supplier code already exists.");

        var supplier = _mapper.Map<Supplier>(dto);
        supplier.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Supplier>().AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<SupplierDto>(supplier);
    }

    public async Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(id, cancellationToken);
        if (supplier is null) return null;
        _mapper.Map(dto, supplier);
        supplier.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Supplier>().Update(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<SupplierDto>(supplier);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(id, cancellationToken);
        if (supplier is null) return false;
        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Supplier>().Update(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
