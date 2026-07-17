---------------------------------------------------------------------
-- EnterpriseManagementDB Functions
-- Scalar and table-valued functions for business logic
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Scalar Function: fn_GetCustomerBalance
-- Returns the outstanding balance for a customer
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.objects WHERE name = N'fn_GetCustomerBalance' AND type = N'FN')
    DROP FUNCTION dbo.fn_GetCustomerBalance;
GO

CREATE FUNCTION dbo.fn_GetCustomerBalance
(
    @CustomerId UNIQUEIDENTIFIER
)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @Balance DECIMAL(18, 2);

    SELECT @Balance = ISNULL(SUM(ar.Amount - ar.PaidAmount), 0)
    FROM dbo.AccountsReceivable ar
    WHERE ar.CustomerId = @CustomerId
      AND ar.Status IN ('Pending', 'Partial');

    RETURN @Balance;
END
GO

---------------------------------------------------------------------
-- Scalar Function: fn_GetProductStockValue
-- Returns the total stock value (at cost) for a product
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.objects WHERE name = N'fn_GetProductStockValue' AND type = N'FN')
    DROP FUNCTION dbo.fn_GetProductStockValue;
GO

CREATE FUNCTION dbo.fn_GetProductStockValue
(
    @ProductId UNIQUEIDENTIFIER
)
RETURNS DECIMAL(18, 2)
AS
BEGIN
    DECLARE @StockValue DECIMAL(18, 2);

    SELECT @StockValue = ISNULL(SUM(p.StockQuantity * p.CostPrice), 0)
    FROM dbo.Products p
    WHERE p.Id = @ProductId;

    RETURN @StockValue;
END
GO

---------------------------------------------------------------------
-- Table-Valued Function: fn_GetRecentAuditLogs
-- Returns the last N audit logs
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.objects WHERE name = N'fn_GetRecentAuditLogs' AND type = N'TF')
    DROP FUNCTION dbo.fn_GetRecentAuditLogs;
GO

CREATE FUNCTION dbo.fn_GetRecentAuditLogs
(
    @NumberOfLogs INT = 100
)
RETURNS @AuditLogs TABLE
(
    Id UNIQUEIDENTIFIER,
    UserId UNIQUEIDENTIFIER,
    Username NVARCHAR(100),
    Action NVARCHAR(200),
    EntityType NVARCHAR(200),
    EntityId UNIQUEIDENTIFIER,
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    IpAddress NVARCHAR(50),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME2
)
AS
BEGIN
    INSERT INTO @AuditLogs
    SELECT TOP (@NumberOfLogs)
        al.Id,
        al.UserId,
        u.Username,
        al.Action,
        al.EntityType,
        al.EntityId,
        al.OldValues,
        al.NewValues,
        al.IpAddress,
        al.UserAgent,
        al.CreatedAt
    FROM dbo.AuditLogs al
    LEFT JOIN dbo.Users u ON al.UserId = u.Id
    ORDER BY al.CreatedAt DESC;

    RETURN;
END
GO

---------------------------------------------------------------------
-- Table-Valued Function: fn_GetDashboardStats
-- Returns dashboard statistics
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.objects WHERE name = N'fn_GetDashboardStats' AND type = N'TF')
    DROP FUNCTION dbo.fn_GetDashboardStats;
GO

CREATE FUNCTION dbo.fn_GetDashboardStats()
RETURNS @Stats TABLE
(
    TotalCustomers INT,
    ActiveCustomers INT,
    TotalProducts INT,
    ActiveProducts INT,
    TotalOrders INT,
    PendingOrders INT,
    TotalInvoices INT,
    PaidInvoices INT,
    OverdueInvoices INT,
    TotalRevenue DECIMAL(18, 2),
    TotalReceivable DECIMAL(18, 2),
    OverdueReceivable DECIMAL(18, 2),
    TotalPayable DECIMAL(18, 2),
    OverduePayable DECIMAL(18, 2),
    LowStockProducts INT,
    RecentOrdersCount INT
)
AS
BEGIN
    INSERT INTO @Stats
    SELECT
        (SELECT COUNT(*) FROM dbo.Customers) AS TotalCustomers,
        (SELECT COUNT(*) FROM dbo.Customers WHERE IsActive = 1) AS ActiveCustomers,
        (SELECT COUNT(*) FROM dbo.Products) AS TotalProducts,
        (SELECT COUNT(*) FROM dbo.Products WHERE IsActive = 1) AS ActiveProducts,
        (SELECT COUNT(*) FROM dbo.Orders) AS TotalOrders,
        (SELECT COUNT(*) FROM dbo.Orders WHERE Status = N'Pending') AS PendingOrders,
        (SELECT COUNT(*) FROM dbo.Invoices) AS TotalInvoices,
        (SELECT COUNT(*) FROM dbo.Invoices WHERE Status = N'Paid') AS PaidInvoices,
        (SELECT COUNT(*) FROM dbo.Invoices WHERE Status = N'Overdue') AS OverdueInvoices,
        (SELECT ISNULL(SUM(TotalAmount + TaxAmount - DiscountAmount), 0) FROM dbo.Orders WHERE Status NOT IN ('Cancelled', 'Draft')) AS TotalRevenue,
        (SELECT ISNULL(SUM(Amount - PaidAmount), 0) FROM dbo.AccountsReceivable WHERE Status IN ('Pending', 'Partial')) AS TotalReceivable,
        (SELECT ISNULL(SUM(Amount - PaidAmount), 0) FROM dbo.AccountsReceivable WHERE Status IN ('Pending', 'Partial') AND DueDate < GETUTCDATE()) AS OverdueReceivable,
        (SELECT ISNULL(SUM(Amount - PaidAmount), 0) FROM dbo.AccountsPayable WHERE Status IN ('Pending', 'Partial')) AS TotalPayable,
        (SELECT ISNULL(SUM(Amount - PaidAmount), 0) FROM dbo.AccountsPayable WHERE Status IN ('Pending', 'Partial') AND DueDate < GETUTCDATE()) AS OverduePayable,
        (SELECT COUNT(*) FROM dbo.Products WHERE StockQuantity <= MinStock) AS LowStockProducts,
        (SELECT COUNT(*) FROM dbo.Orders WHERE OrderDate >= DATEADD(DAY, -7, GETUTCDATE())) AS RecentOrdersCount;

    RETURN;
END
GO

---------------------------------------------------------------------
-- Functions creation complete
---------------------------------------------------------------------
PRINT N'Functions created successfully for EnterpriseManagementDB.';
GO
