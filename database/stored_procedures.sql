---------------------------------------------------------------------
-- EnterpriseManagementDB Stored Procedures
-- Business logic and data access procedures
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Stored Procedure: GetCustomerOrders
-- Search orders by customer with optional date range
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetCustomerOrders' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetCustomerOrders;
GO

CREATE PROCEDURE dbo.GetCustomerOrders
    @CustomerId UNIQUEIDENTIFIER = NULL,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL,
    @Status NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            o.Id,
            o.OrderNumber,
            o.CustomerId,
            c.Name AS CustomerName,
            c.Code AS CustomerCode,
            o.OrderDate,
            o.TotalAmount,
            o.TaxAmount,
            o.DiscountAmount,
            o.Status,
            o.Notes,
            o.CreatedAt,
            o.UpdatedAt
        FROM dbo.Orders o
        INNER JOIN dbo.Customers c ON o.CustomerId = c.Id
        WHERE
            (@CustomerId IS NULL OR o.CustomerId = @CustomerId)
            AND (@StartDate IS NULL OR o.OrderDate >= @StartDate)
            AND (@EndDate IS NULL OR o.OrderDate <= @EndDate)
            AND (@Status IS NULL OR o.Status = @Status)
        ORDER BY o.OrderDate DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: GetProductStockHistory
-- Get stock movements for a specific product
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetProductStockHistory' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetProductStockHistory;
GO

CREATE PROCEDURE dbo.GetProductStockHistory
    @ProductId UNIQUEIDENTIFIER,
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            i.Id,
            i.ProductId,
            p.Code AS ProductCode,
            p.Name AS ProductName,
            i.MovementType,
            i.Quantity,
            i.Reference,
            i.Notes,
            i.CreatedAt,
            u.Username AS CreatedByUser
        FROM dbo.Inventory i
        INNER JOIN dbo.Products p ON i.ProductId = p.Id
        LEFT JOIN dbo.Users u ON i.CreatedBy = u.Id
        WHERE
            i.ProductId = @ProductId
            AND (@StartDate IS NULL OR i.CreatedAt >= @StartDate)
            AND (@EndDate IS NULL OR i.CreatedAt <= @EndDate)
        ORDER BY i.CreatedAt DESC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: GetOverdueAccountsReceivable
-- Get overdue customer invoices
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetOverdueAccountsReceivable' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetOverdueAccountsReceivable;
GO

CREATE PROCEDURE dbo.GetOverdueAccountsReceivable
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            ar.Id,
            ar.CustomerId,
            c.Code AS CustomerCode,
            c.Name AS CustomerName,
            c.Email AS CustomerEmail,
            i.InvoiceNumber,
            i.InvoiceDate,
            ar.DueDate,
            ar.Amount,
            ar.PaidAmount,
            (ar.Amount - ar.PaidAmount) AS OutstandingAmount,
            DATEDIFF(DAY, ar.DueDate, GETUTCDATE()) AS DaysOverdue,
            ar.Status,
            ar.PaymentDate,
            ar.Notes
        FROM dbo.AccountsReceivable ar
        INNER JOIN dbo.Customers c ON ar.CustomerId = c.Id
        INNER JOIN dbo.Invoices i ON ar.InvoiceId = i.Id
        WHERE
            ar.Status IN ('Pending', 'Partial')
            AND ar.DueDate < GETUTCDATE()
        ORDER BY ar.DueDate ASC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: GetOverdueAccountsPayable
-- Get overdue supplier invoices
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetOverdueAccountsPayable' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetOverdueAccountsPayable;
GO

CREATE PROCEDURE dbo.GetOverdueAccountsPayable
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            ap.Id,
            ap.SupplierId,
            s.Code AS SupplierCode,
            s.Name AS SupplierName,
            s.Email AS SupplierEmail,
            i.InvoiceNumber,
            i.InvoiceDate,
            ap.DueDate,
            ap.Amount,
            ap.PaidAmount,
            (ap.Amount - ap.PaidAmount) AS OutstandingAmount,
            DATEDIFF(DAY, ap.DueDate, GETUTCDATE()) AS DaysOverdue,
            ap.Status,
            ap.PaymentDate,
            ap.Notes
        FROM dbo.AccountsPayable ap
        INNER JOIN dbo.Suppliers s ON ap.SupplierId = s.Id
        INNER JOIN dbo.Invoices i ON ap.InvoiceId = i.Id
        WHERE
            ap.Status IN ('Pending', 'Partial')
            AND ap.DueDate < GETUTCDATE()
        ORDER BY ap.DueDate ASC;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: GetSalesReport
-- Sales report with date range parameters
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetSalesReport' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetSalesReport;
GO

CREATE PROCEDURE dbo.GetSalesReport
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @GroupBy NVARCHAR(20) = N'Day'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        IF @GroupBy = N'Month'
        BEGIN
            SELECT
                FORMAT(o.OrderDate, N'yyyy-MM') AS Period,
                COUNT(o.Id) AS TotalOrders,
                SUM(o.TotalAmount) AS TotalSales,
                SUM(o.TaxAmount) AS TotalTax,
                SUM(o.DiscountAmount) AS TotalDiscounts,
                SUM(o.TotalAmount + o.TaxAmount - o.DiscountAmount) AS NetRevenue,
                COUNT(DISTINCT o.CustomerId) AS UniqueCustomers,
                SUM(oi.Quantity) AS TotalItemsSold
            FROM dbo.Orders o
            INNER JOIN dbo.OrderItems oi ON o.Id = oi.OrderId
            WHERE o.OrderDate >= @StartDate AND o.OrderDate < @EndDate
                AND o.Status NOT IN ('Cancelled', 'Draft')
            GROUP BY FORMAT(o.OrderDate, N'yyyy-MM')
            ORDER BY Period;
        END
        ELSE
        BEGIN
            SELECT
                CAST(o.OrderDate AS DATE) AS Period,
                COUNT(o.Id) AS TotalOrders,
                SUM(o.TotalAmount) AS TotalSales,
                SUM(o.TaxAmount) AS TotalTax,
                SUM(o.DiscountAmount) AS TotalDiscounts,
                SUM(o.TotalAmount + o.TaxAmount - o.DiscountAmount) AS NetRevenue,
                COUNT(DISTINCT o.CustomerId) AS UniqueCustomers,
                SUM(oi.Quantity) AS TotalItemsSold
            FROM dbo.Orders o
            INNER JOIN dbo.OrderItems oi ON o.Id = oi.OrderId
            WHERE o.OrderDate >= @StartDate AND o.OrderDate < @EndDate
                AND o.Status NOT IN ('Cancelled', 'Draft')
            GROUP BY CAST(o.OrderDate AS DATE)
            ORDER BY Period;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: GetInventoryReport
-- Inventory report with current stock levels
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'GetInventoryReport' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.GetInventoryReport;
GO

CREATE PROCEDURE dbo.GetInventoryReport
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @LowStockOnly BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            p.Id,
            p.Code,
            p.Name,
            c.Code AS CategoryCode,
            c.Name AS CategoryName,
            p.CostPrice,
            p.SalePrice,
            p.StockQuantity,
            p.MinStock,
            (p.StockQuantity * p.CostPrice) AS StockValue,
            (p.StockQuantity * p.SalePrice) AS RetailValue,
            CASE WHEN p.StockQuantity <= p.MinStock THEN 1 ELSE 0 END AS IsLowStock,
            p.IsActive
        FROM dbo.Products p
        INNER JOIN dbo.Categories c ON p.CategoryId = c.Id
        WHERE
            (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
            AND (@LowStockOnly = 0 OR p.StockQuantity <= p.MinStock)
        ORDER BY c.Name, p.Name;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: SearchCustomers
-- Full-text search for customers
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'SearchCustomers' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.SearchCustomers;
GO

CREATE PROCEDURE dbo.SearchCustomers
    @SearchTerm NVARCHAR(200) = NULL,
    @IsActive BIT = NULL,
    @City NVARCHAR(100) = NULL,
    @State NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            c.Id,
            c.Code,
            c.Name,
            c.Email,
            c.Phone,
            c.Address,
            c.City,
            c.State,
            c.ZipCode,
            c.Country,
            c.TaxId,
            c.IsActive,
            c.CreatedAt,
            c.UpdatedAt
        FROM dbo.Customers c
        WHERE
            (@SearchTerm IS NULL
                OR c.Name LIKE N'%' + @SearchTerm + N'%'
                OR c.Code LIKE N'%' + @SearchTerm + N'%'
                OR c.Email LIKE N'%' + @SearchTerm + N'%'
                OR c.Phone LIKE N'%' + @SearchTerm + N'%')
            AND (@IsActive IS NULL OR c.IsActive = @IsActive)
            AND (@City IS NULL OR c.City = @City)
            AND (@State IS NULL OR c.State = @State)
        ORDER BY c.Name;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: SearchProducts
-- Search products with optional filters
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'SearchProducts' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.SearchProducts;
GO

CREATE PROCEDURE dbo.SearchProducts
    @SearchTerm NVARCHAR(200) = NULL,
    @CategoryId UNIQUEIDENTIFIER = NULL,
    @IsActive BIT = NULL,
    @MinPrice DECIMAL(18, 2) = NULL,
    @MaxPrice DECIMAL(18, 2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        SELECT
            p.Id,
            p.Code,
            p.Name,
            p.Description,
            p.CategoryId,
            c.Name AS CategoryName,
            p.CostPrice,
            p.SalePrice,
            p.StockQuantity,
            p.MinStock,
            p.Barcode,
            p.IsActive,
            p.CreatedAt,
            p.UpdatedAt
        FROM dbo.Products p
        INNER JOIN dbo.Categories c ON p.CategoryId = c.Id
        WHERE
            (@SearchTerm IS NULL
                OR p.Name LIKE N'%' + @SearchTerm + N'%'
                OR p.Code LIKE N'%' + @SearchTerm + N'%'
                OR p.Barcode LIKE N'%' + @SearchTerm + N'%')
            AND (@CategoryId IS NULL OR p.CategoryId = @CategoryId)
            AND (@IsActive IS NULL OR p.IsActive = @IsActive)
            AND (@MinPrice IS NULL OR p.SalePrice >= @MinPrice)
            AND (@MaxPrice IS NULL OR p.SalePrice <= @MaxPrice)
        ORDER BY c.Name, p.Name;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: sp_GenerateOrderNumber
-- Generate a unique order number
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'sp_GenerateOrderNumber' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.sp_GenerateOrderNumber;
GO

CREATE PROCEDURE dbo.sp_GenerateOrderNumber
    @OrderNumber NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @Prefix NVARCHAR(10);
        DECLARE @NextNumber INT;

        SELECT @Prefix = Value FROM dbo.CompanySettings WHERE [Key] = N'OrderPrefix';
        IF @Prefix IS NULL SET @Prefix = N'ORD-';

        SELECT @NextNumber = ISNULL(MAX(CAST(SUBSTRING(OrderNumber, LEN(@Prefix) + 1, 10) AS INT)), 0) + 1
        FROM dbo.Orders
        WHERE OrderNumber LIKE @Prefix + N'%';

        SET @OrderNumber = @Prefix + RIGHT(N'000000' + CAST(@NextNumber AS NVARCHAR(6)), 6);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: sp_GenerateInvoiceNumber
-- Generate a unique invoice number
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'sp_GenerateInvoiceNumber' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.sp_GenerateInvoiceNumber;
GO

CREATE PROCEDURE dbo.sp_GenerateInvoiceNumber
    @InvoiceNumber NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @Prefix NVARCHAR(10);
        DECLARE @NextNumber INT;

        SELECT @Prefix = Value FROM dbo.CompanySettings WHERE [Key] = N'InvoicePrefix';
        IF @Prefix IS NULL SET @Prefix = N'INV-';

        SELECT @NextNumber = ISNULL(MAX(CAST(SUBSTRING(InvoiceNumber, LEN(@Prefix) + 1, 10) AS INT)), 0) + 1
        FROM dbo.Invoices
        WHERE InvoiceNumber LIKE @Prefix + N'%';

        SET @InvoiceNumber = @Prefix + RIGHT(N'000000' + CAST(@NextNumber AS NVARCHAR(6)), 6);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: sp_UpdateOrderStatus
-- Update order status with validation
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'sp_UpdateOrderStatus' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.sp_UpdateOrderStatus;
GO

CREATE PROCEDURE dbo.sp_UpdateOrderStatus
    @OrderId UNIQUEIDENTIFIER,
    @NewStatus NVARCHAR(50),
    @UpdatedBy UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @CurrentStatus NVARCHAR(50);

        SELECT @CurrentStatus = Status FROM dbo.Orders WHERE Id = @OrderId;

        IF @CurrentStatus IS NULL
        BEGIN
            RAISERROR(N'Order not found.', 16, 1);
            RETURN;
        END

        IF @CurrentStatus = N'Cancelled' AND @NewStatus NOT IN (N'Cancelled')
        BEGIN
            RAISERROR(N'Cannot update a cancelled order.', 16, 1);
            RETURN;
        END

        IF @NewStatus NOT IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
        BEGIN
            RAISERROR(N'Invalid status value.', 16, 1);
            RETURN;
        END

        UPDATE dbo.Orders
        SET Status = @NewStatus,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @OrderId;

        INSERT INTO dbo.AuditLogs (UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress)
        VALUES (@UpdatedBy, N'Update', N'Order', @OrderId,
            N'{"Status":"' + @CurrentStatus + N'"}',
            N'{"Status":"' + @NewStatus + N'"}',
            NULL);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedure: sp_UpdateInvoiceStatus
-- Update invoice status with validation
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.procedures WHERE name = N'sp_UpdateInvoiceStatus' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP PROCEDURE dbo.sp_UpdateInvoiceStatus;
GO

CREATE PROCEDURE dbo.sp_UpdateInvoiceStatus
    @InvoiceId UNIQUEIDENTIFIER,
    @NewStatus NVARCHAR(50),
    @UpdatedBy UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @CurrentStatus NVARCHAR(50);

        SELECT @CurrentStatus = Status FROM dbo.Invoices WHERE Id = @InvoiceId;

        IF @CurrentStatus IS NULL
        BEGIN
            RAISERROR(N'Invoice not found.', 16, 1);
            RETURN;
        END

        IF @CurrentStatus = N'Cancelled' AND @NewStatus NOT IN (N'Cancelled')
        BEGIN
            RAISERROR(N'Cannot update a cancelled invoice.', 16, 1);
            RETURN;
        END

        IF @NewStatus NOT IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')
        BEGIN
            RAISERROR(N'Invalid status value.', 16, 1);
            RETURN;
        END

        UPDATE dbo.Invoices
        SET Status = @NewStatus
        WHERE Id = @InvoiceId;

        INSERT INTO dbo.AuditLogs (UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress)
        VALUES (@UpdatedBy, N'Update', N'Invoice', @InvoiceId,
            N'{"Status":"' + @CurrentStatus + N'"}',
            N'{"Status":"' + @NewStatus + N'"}',
            NULL);
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

---------------------------------------------------------------------
-- Stored Procedures creation complete
---------------------------------------------------------------------
PRINT N'Stored procedures created successfully for EnterpriseManagementDB.';
GO
