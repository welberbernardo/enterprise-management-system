using AutoMapper;
using EnterpriseManagement.Core.DTOs.Invoices;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements invoice management, status changes, and PDF generation.</summary>
public class InvoiceService : IInvoiceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPdfService _pdfService;

    public InvoiceService(IUnitOfWork unitOfWork, IMapper mapper, IPdfService pdfService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _pdfService = pdfService;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _unitOfWork.Repository<Invoice>().Query().Include(i => i.Order).ToListAsync(cancellationToken);
        return _mapper.Map<IEnumerable<InvoiceDto>>(items);
    }

    public async Task<InvoiceDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await _unitOfWork.Repository<Invoice>().Query().Include(i => i.Order).FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
        return item is null ? null : _mapper.Map<InvoiceDto>(item);
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(dto.OrderId, cancellationToken);
        if (order is null) throw new InvalidOperationException("Order not found.");

        var invoice = new Invoice
        {
            OrderId = dto.OrderId,
            InvoiceNumber = await GenerateInvoiceNumberAsync(cancellationToken),
            InvoiceDate = DateTime.UtcNow,
            DueDate = dto.DueDate,
            TotalAmount = order.TotalAmount,
            TaxAmount = dto.TaxAmount,
            Status = InvoiceStatus.Draft,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Repository<Invoice>().AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<InvoiceDto?> UpdateAsync(int id, UpdateInvoiceDto dto, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(id, cancellationToken);
        if (invoice is null) return null;
        invoice.DueDate = dto.DueDate;
        invoice.TaxAmount = dto.TaxAmount;
        invoice.Notes = dto.Notes;
        _unitOfWork.Repository<Invoice>().Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<InvoiceDto>(invoice);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(id, cancellationToken);
        if (invoice is null) return false;
        invoice.Status = InvoiceStatus.Cancelled;
        _unitOfWork.Repository<Invoice>().Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ChangeStatusAsync(int id, ChangeInvoiceStatusDto dto, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().GetByIdAsync(id, cancellationToken);
        if (invoice is null) return false;
        invoice.Status = dto.Status;
        _unitOfWork.Repository<Invoice>().Update(invoice);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<byte[]> GeneratePdfAsync(int id, CancellationToken cancellationToken = default)
    {
        var invoice = await _unitOfWork.Repository<Invoice>().Query().Include(i => i.Order).FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
            ?? throw new InvalidOperationException("Invoice not found.");
        var html = $"<h1>Invoice {invoice.InvoiceNumber}</h1><p>Order: {invoice.Order?.OrderNumber}</p><p>Total: {invoice.TotalAmount:C}</p><p>Status: {invoice.Status}</p>";
        return _pdfService.GenerateFromHtml(html, new Dictionary<string, string> { { "Invoice", invoice.InvoiceNumber } });
    }

    private async Task<string> GenerateInvoiceNumberAsync(CancellationToken cancellationToken)
    {
        var count = await _unitOfWork.Repository<Invoice>().Query().CountAsync(cancellationToken);
        return $"INV-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";
    }
}
