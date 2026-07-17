using AutoMapper;
using EnterpriseManagement.Core.DTOs.Common;
using EnterpriseManagement.Core.DTOs.Orders;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements order management and status workflows.</summary>
public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IAuditService _auditService;

    public OrderService(IUnitOfWork unitOfWork, IMapper mapper, IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _auditService = auditService;
    }

    public async Task<PagedResult<OrderDto>> GetPagedAsync(int page, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        IQueryable<Order> query = _unitOfWork.Repository<Order>().Query().Include(o => o.Customer);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(o => o.OrderNumber.ToLower().Contains(s) || (o.Customer != null && o.Customer.Name.ToLower().Contains(s)));
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query.OrderByDescending(o => o.OrderDate).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PagedResult<OrderDto>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = _mapper.Map<IReadOnlyList<OrderDto>>(items)
        };
    }

    public async Task<OrderDetailDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)!.ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        return order is null ? null : _mapper.Map<OrderDetailDto>(order);
    }

    public async Task<OrderDetailDto> CreateAsync(CreateOrderDto dto, CancellationToken cancellationToken = default)
    {
        var order = new Order
        {
            CustomerId = dto.CustomerId,
            OrderNumber = await GenerateOrderNumberAsync(cancellationToken),
            OrderDate = DateTime.UtcNow,
            TaxAmount = dto.TaxAmount,
            DiscountAmount = dto.DiscountAmount,
            Notes = dto.Notes,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        order.OrderItems = new List<OrderItem>();
        decimal total = 0;
        foreach (var item in dto.Items)
        {
            var lineTotal = item.Quantity * item.UnitPrice - item.Discount;
            total += lineTotal;
            order.OrderItems!.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Discount = item.Discount,
                TotalPrice = lineTotal
            });
        }

        order.TotalAmount = total + dto.TaxAmount - dto.DiscountAmount;

        await _unitOfWork.Repository<Order>().AddAsync(order, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<OrderDetailDto>(order);
    }

    public async Task<OrderDto?> UpdateAsync(int id, UpdateOrderDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(id, cancellationToken);
        if (order is null) return null;
        order.TaxAmount = dto.TaxAmount;
        order.DiscountAmount = dto.DiscountAmount;
        order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;
        order.TotalAmount = order.TotalAmount - 0; // base recalculation handled externally
        _unitOfWork.Repository<Order>().Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return _mapper.Map<OrderDto>(order);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(id, cancellationToken);
        if (order is null) return false;
        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Order>().Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ChangeStatusAsync(int id, ChangeOrderStatusDto dto, CancellationToken cancellationToken = default)
    {
        var order = await _unitOfWork.Repository<Order>().GetByIdAsync(id, cancellationToken);
        if (order is null) return false;
        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Repository<Order>().Update(order);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _auditService.LogAsync(null, "ChangeOrderStatus", nameof(Order), order.Id.ToString(), newValues: dto.Status.ToString(), cancellationToken: cancellationToken);
        return true;
    }

    private async Task<string> GenerateOrderNumberAsync(CancellationToken cancellationToken)
    {
        var count = await _unitOfWork.Repository<Order>().Query().CountAsync(cancellationToken);
        return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{count + 1:D4}";
    }
}
