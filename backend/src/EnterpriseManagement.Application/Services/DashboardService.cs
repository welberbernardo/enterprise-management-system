using AutoMapper;
using EnterpriseManagement.Core.DTOs.Reports;
using EnterpriseManagement.Core.Entities;
using EnterpriseManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EnterpriseManagement.Application.Services;

/// <summary>Implements dashboard statistics and activity aggregation.</summary>
public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalCustomers = await _unitOfWork.Repository<Customer>().Query().CountAsync(cancellationToken);
        var totalSuppliers = await _unitOfWork.Repository<Supplier>().Query().CountAsync(cancellationToken);
        var totalProducts = await _unitOfWork.Repository<Product>().Query().CountAsync(cancellationToken);
        var totalOrders = await _unitOfWork.Repository<Order>().Query().CountAsync(cancellationToken);
        var lowStockProducts = await _unitOfWork.Repository<Product>().Query().CountAsync(p => p.StockQuantity <= p.MinStock, cancellationToken);

        var receivables = await _unitOfWork.Repository<AccountReceivable>().Query().SumAsync(r => r.Amount - r.PaidAmount, cancellationToken);
        var payables = await _unitOfWork.Repository<AccountPayable>().Query().SumAsync(p => p.Amount - p.PaidAmount, cancellationToken);

        var monthlyRevenue = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.OrderDate >= monthStart)
            .SumAsync(o => o.TotalAmount, cancellationToken);

        return new DashboardStatsDto
        {
            TotalCustomers = totalCustomers,
            TotalSuppliers = totalSuppliers,
            TotalProducts = totalProducts,
            TotalOrders = totalOrders,
            LowStockProducts = lowStockProducts,
            TotalReceivables = receivables,
            TotalPayables = payables,
            MonthlyRevenue = monthlyRevenue,
            TotalSales = monthlyRevenue
        };
    }

    public async Task<SalesChartDto> GetSalesChartAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var monthlySales = new List<ChartDataDto>();
        for (int i = 5; i >= 0; i--)
        {
            var month = now.AddMonths(-i);
            var start = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = start.AddMonths(1);
            var value = await _unitOfWork.Repository<Order>().Query()
                .Where(o => o.OrderDate >= start && o.OrderDate < end)
                .SumAsync(o => o.TotalAmount, cancellationToken);
            monthlySales.Add(new ChartDataDto { Label = month.ToString("MMM"), Value = value });
        }

        var topProducts = await _unitOfWork.Repository<OrderItem>().Query()
            .Include(oi => oi.Product)
            .GroupBy(oi => oi.Product!.Name)
            .Select(g => new ChartDataDto { Label = g.Key, Value = g.Sum(x => x.TotalPrice) })
            .OrderByDescending(x => x.Value)
            .Take(5)
            .ToListAsync(cancellationToken);

        return new SalesChartDto { MonthlySales = monthlySales, TopProducts = topProducts };
    }

    public async Task<IEnumerable<RecentActivityDto>> GetRecentActivityAsync(int count = 10, CancellationToken cancellationToken = default)
    {
        var logs = await _unitOfWork.Repository<AuditLog>().Query()
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);

        return logs.Select(l => new RecentActivityDto
        {
            Id = l.Id,
            Action = l.Action,
            EntityType = l.EntityType,
            UserName = l.User != null ? $"{l.User.FirstName} {l.User.LastName}" : null,
            CreatedAt = l.CreatedAt
        });
    }
}
