using AutoMapper;
using EnterpriseManagement.Core.DTOs.Accounts;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements accounts receivable management and payment tracking.</summary>
public class AccountReceivableService : IAccountReceivableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AccountReceivableService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<AccountReceivableDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<AccountReceivable>().Query().Include(a => a.Customer).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<AccountReceivableDto>>(items);
    }

    public async Task<AccountReceivableDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<AccountReceivable>().Query().Include(a => a.Customer).FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        return item is null ? null : _mapper.Map<AccountReceivableDto>(item);
    }

    public async Task<AccountReceivableDto> CreateAsync(CreateAccountReceivableDto dto, CancellationToken cancellationToken = default)
    {
        var receivable = new AccountReceivable
        {
            CustomerId = dto.CustomerId,
            InvoiceId = dto.InvoiceId,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            PaidAmount = 0,
            Status = ReceivableStatus.Pending,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<AccountReceivable>().AddAsync(receivable, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<AccountReceivableDto>(receivable);
    }

    public async Task<bool> RecordPaymentAsync(int id, ReceivablePaymentDto dto, CancellationToken cancellationToken = default)
    {
        var receivable = await _unitOfWork.Repository<AccountReceivable>().GetByIdAsync(id, cancellationToken);
        if (receivable is null) return false;

        receivable.PaidAmount += dto.Amount;
        if (receivable.PaidAmount >= receivable.Amount)
        {
            receivable.Status = ReceivableStatus.Paid;
            receivable.PaymentDate = dto.PaymentDate ?? DateTime.UtcNow;
        }
        else
        {
            receivable.Status = ReceivableStatus.Partial;
        }
        _unitOfWork.Repository<AccountReceivable>().Update(receivable);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var receivable = await _unitOfWork.Repository<AccountReceivable>().GetByIdAsync(id, cancellationToken);
        if (receivable is null) return false;
        _unitOfWork.Repository<AccountReceivable>().Remove(receivable);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
