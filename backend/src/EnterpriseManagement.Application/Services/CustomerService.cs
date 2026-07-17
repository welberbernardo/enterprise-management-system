using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements customer management and search.</summary>
public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CustomerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<PagedResult<CustomerDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _unitOfWork.Repository<Customer>().Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || c.Code.ToLower().Contains(s) || (c.Email != null && c.Email.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderBy(c => c.Name).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<CustomerDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<CustomerDto>>(items)
        };
    }

    public async Task<CustomerDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Repository<Customer>().Query()
            .Include(c => c.Contacts)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        return customer is null ? null : _mapper.Map<CustomerDetailDto>(customer);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _unitOfWork.Repository<Customer>().AnyAsync(c => c.Code == dto.Code, cancellationToken);
        if (exists) throw new InvalidOperationException("Customer code already exists.");

        var customer = _mapper.Map<Customer>(dto);
        customer.CreatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<Customer>().AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CustomerDto>(customer);
    }

    public async Task<CustomerDto?> UpdateAsync(int id, UpdateCustomerDto dto, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(id, cancellationToken);
        if (customer is null) return null;
        _mapper.Map(dto, customer);
        customer.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Customer>().Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CustomerDto>(customer);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var customer = await _unitOfWork.Repository<Customer>().GetByIdAsync(id, cancellationToken);
        if (customer is null) return false;
        customer.IsActive = false;
        customer.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Customer>().Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
