using AutoMapper;
using EnterpriseManagement.Core.DTOs.Customers;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements customer contact management.</summary>
public class CustomerContactService : ICustomerContactService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CustomerContactService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CustomerContactDto>> GetByCustomerAsync(int customerId, CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<CustomerContact>().Query().Where(c => c.CustomerId == customerId).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<CustomerContactDto>>(items);
    }

    public async Task<CustomerContactDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<CustomerContact>().GetByIdAsync(id, cancellationToken);
        return item is null ? null : _mapper.Map<CustomerContactDto>(item);
    }

    public async Task<CustomerContactDto> CreateAsync(CreateCustomerContactDto dto, CancellationToken cancellationToken = default)
    {
        var contact = _mapper.Map<CustomerContact>(dto);
        await _unitOfWork.Repository<CustomerContact>().AddAsync(contact, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CustomerContactDto>(contact);
    }

    public async Task<CustomerContactDto?> UpdateAsync(int id, UpdateCustomerContactDto dto, CancellationToken cancellationToken = default)
    {
        var contact = await _unitOfWork.Repository<CustomerContact>().GetByIdAsync(id, cancellationToken);
        if (contact is null) return null;
        _mapper.Map(dto, contact);
        _unitOfWork.Repository<CustomerContact>().Update(contact);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<CustomerContactDto>(contact);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var contact = await _unitOfWork.Repository<CustomerContact>().GetByIdAsync(id, cancellationToken);
        if (contact is null) return false;
        _unitOfWork.Repository<CustomerContact>().Remove(contact);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
