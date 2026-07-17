namespace EnterpriseManagement.Core.DTOs.Reports;

/// <summary>Key performance indicators for the dashboard.</summary>
public class DashboardStatsDto
{
    public int TotalCustomers { get; set; }
    public int TotalSuppliers { get; set; }
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public int LowStockProducts { get; set; }
    public decimal TotalSales { get; set; }
    public decimal TotalReceivables { get; set; }
    public decimal TotalPayables { get; set; }
    public decimal MonthlyRevenue { get; set; }
}

/// <summary>Chart data point.</summary>
public class ChartDataDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

/// <summary>Sales chart payload.</summary>
public class SalesChartDto
{
    public IEnumerable<ChartDataDto> MonthlySales { get; set; } = new List<ChartDataDto>();
    public IEnumerable<ChartDataDto> TopProducts { get; set; } = new List<ChartDataDto>();
}

/// <summary>Recent activity entry for the dashboard.</summary>
public class RecentActivityDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Report filter parameters.</summary>
public class ReportQueryDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? CustomerId { get; set; }
    public int? ProductId { get; set; }
}

/// <summary>Generic report row.</summary>
public class ReportRowDto
{
    public string Label { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public int Count { get; set; }
}
