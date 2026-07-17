using EnterpriseManagement.Core.DTOs.Reports;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements reporting across sales, inventory, customers, products, and finance.</summary>
public class ReportService : IReportService
{
    private readonly IUnitOfWork _unitOfWork;

    public ReportService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<ReportRowDto>> GetSalesReportAsync(ReportQueryDto query, CancellationToken cancellationToken = default)
    {
        var orders = _unitOfWork.Repository<Order>().Query();
        orders = ApplyDateFilter(orders, query, cancellationToken);

        var result = await orders
            .GroupBy(o => o.Status)
            .Select(g => new ReportRowDto { Label = g.Key.ToString(), Value = g.Sum(x => x.TotalAmount), Count = g.Count() })
            .ToListAsync(cancellationToken);

        return result;
    }

    public async Task<IEnumerable<ReportRowDto>> GetInventoryReportAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Repository<Product>().Query()
            .GroupBy(p => p.CategoryId)
            .Select(g => new ReportRowDto { Label = "Category " + g.Key, Value = g.Sum(x => x.StockQuantity * x.CostPrice), Count = g.Count() })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReportRowDto>> GetCustomersReportAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Repository<Customer>().Query()
            .Select(c => new ReportRowDto { Label = c.Name, Value = 0, Count = c.Orders != null ? c.Orders.Count : 0 })
            .OrderByDescending(r => r.Count)
            .Take(20)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReportRowDto>> GetProductsReportAsync(CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Repository<Product>().Query()
            .Select(p => new ReportRowDto { Label = p.Name, Value = p.StockQuantity * p.SalePrice, Count = p.StockQuantity })
            .OrderByDescending(r => r.Value)
            .Take(20)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReportRowDto>> GetFinancialReportAsync(ReportQueryDto query, CancellationToken cancellationToken = default)
    {
        var receivables = await _unitOfWork.Repository<AccountReceivable>().Query()
            .Where(r => (!query.StartDate.HasValue || r.CreatedAt >= query.StartDate) && (!query.EndDate.HasValue || r.CreatedAt <= query.EndDate))
            .SumAsync(r => r.Amount - r.PaidAmount, cancellationToken);

        var payables = await _unitOfWork.Repository<AccountPayable>().Query()
            .Where(p => (!query.StartDate.HasValue || p.CreatedAt >= query.StartDate) && (!query.EndDate.HasValue || p.CreatedAt <= query.EndDate))
            .SumAsync(p => p.Amount - p.PaidAmount, cancellationToken);

        return new List<ReportRowDto>
        {
            new() { Label = "Receivables", Value = receivables, Count = 1 },
            new() { Label = "Payables", Value = payables, Count = 1 },
            new() { Label = "Net", Value = receivables - payables, Count = 1 }
        };
    }

    private static IQueryable<Order> ApplyDateFilter(IQueryable<Order> query, ReportQueryDto q, CancellationToken _)
    {
        if (q.StartDate.HasValue) query = query.Where(o => o.OrderDate >= q.StartDate.Value);
        if (q.EndDate.HasValue) query = query.Where(o => o.OrderDate <= q.EndDate.Value);
        return query;
    }
}
