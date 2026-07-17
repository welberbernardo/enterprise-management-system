using AutoMapper;
using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements accounts payable management and payment tracking.</summary>
public class AccountPayableService : IAccountPayableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AccountPayableService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AccountPayableDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<AccountPayable>().Query().Include(a => a.Supplier).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<AccountPayableDto>>(items);
    }

    public async Task<AccountPayableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<AccountPayable>().Query().Include(a => a.Supplier).FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        return item is null ? null : _mapper.Map<AccountPayableDto>(item);
    }

    public async Task<AccountPayableDto> CreateAsync(CreateAccountPayableDto dto, CancellationToken cancellationToken = default)
    {
        var payable = new AccountPayable
        {
            SupplierId = dto.SupplierId,
            InvoiceId = dto.InvoiceId,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            PaidAmount = 0,
            Status = PayableStatus.Pending,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<AccountPayable>().AddAsync(payable, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<AccountPayableDto>(payable);
    }

    public async Task<bool> RecordPaymentAsync(int id, PayablePaymentDto dto, CancellationToken cancellationToken = default)
    {
        var payable = await _unitOfWork.Repository<AccountPayable>().GetByIdAsync(id, cancellationToken);
        if (payable is null) return false;

        payable.PaidAmount += dto.Amount;
        if (payable.PaidAmount >= payable.Amount)
        {
            payable.Status = PayableStatus.Paid;
            payable.PaymentDate = dto.PaymentDate ?? DateTime.UtcNow;
        }
        else
        {
            payable.Status = PayableStatus.Partial;
        }
        _unitOfWork.Repository<AccountPayable>().Update(payable);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var payable = await _unitOfWork.Repository<AccountPayable>().GetByIdAsync(id, cancellationToken);
        if (payable is null) return false;
        _unitOfWork.Repository<AccountPayable>().Remove(payable);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
