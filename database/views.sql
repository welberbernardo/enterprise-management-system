---------------------------------------------------------------------
-- EnterpriseManagementDB Views
-- Reporting and analytical views
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- View: vw_OrderSummary
-- Order summary with customer details
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_OrderSummary' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_OrderSummary;
GO

CREATE VIEW dbo.vw_OrderSummary
AS
SELECT
    o.Id,
    o.OrderNumber,
    o.CustomerId,
    c.Code AS CustomerCode,
    c.Name AS CustomerName,
    c.Email AS CustomerEmail,
    c.Phone AS CustomerPhone,
    c.City AS CustomerCity,
    c.State AS CustomerState,
    o.OrderDate,
    o.TotalAmount,
    o.TaxAmount,
    o.DiscountAmount,
    (o.TotalAmount + o.TaxAmount - o.DiscountAmount) AS NetAmount,
    o.Status,
    o.Notes,
    o.CreatedAt,
    o.UpdatedAt,
    COUNT(oi.Id) AS TotalItems,
    SUM(oi.Quantity) AS TotalQuantity
FROM dbo.Orders o
INNER JOIN dbo.Customers c ON o.CustomerId = c.Id
LEFT JOIN dbo.OrderItems oi ON o.Id = oi.OrderId
GROUP BY
    o.Id, o.OrderNumber, o.CustomerId, c.Code, c.Name, c.Email, c.Phone, c.City, c.State,
    o.OrderDate, o.TotalAmount, o.TaxAmount, o.DiscountAmount, o.Status, o.Notes,
    o.CreatedAt, o.UpdatedAt;
GO

---------------------------------------------------------------------
-- View: vw_ProductWithCategory
-- Product details with category information
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_ProductWithCategory' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_ProductWithCategory;
GO

CREATE VIEW dbo.vw_ProductWithCategory
AS
SELECT
    p.Id,
    p.Code,
    p.Name,
    p.Description,
    p.CategoryId,
    c.Code AS CategoryCode,
    c.Name AS CategoryName,
    c.Description AS CategoryDescription,
    p.CostPrice,
    p.SalePrice,
    (p.SalePrice - p.CostPrice) AS ProfitMargin,
    CASE WHEN p.CostPrice > 0 THEN ((p.SalePrice - p.CostPrice) / p.CostPrice) * 100 ELSE 0 END AS ProfitMarginPercentage,
    p.StockQuantity,
    p.MinStock,
    p.Barcode,
    p.IsActive,
    p.CreatedAt,
    p.UpdatedAt
FROM dbo.Products p
INNER JOIN dbo.Categories c ON p.CategoryId = c.Id;
GO

---------------------------------------------------------------------
-- View: vw_CustomerWithContacts
-- Customer details with primary contact
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_CustomerWithContacts' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_CustomerWithContacts;
GO

CREATE VIEW dbo.vw_CustomerWithContacts
AS
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
    c.UpdatedAt,
    pc.Id AS PrimaryContactId,
    pc.Name AS PrimaryContactName,
    pc.Email AS PrimaryContactEmail,
    pc.Phone AS PrimaryContactPhone,
    pc.Position AS PrimaryContactPosition
FROM dbo.Customers c
LEFT JOIN dbo.CustomerContacts pc ON c.Id = pc.CustomerId AND pc.IsPrimary = 1;
GO

---------------------------------------------------------------------
-- View: vw_InvoiceSummary
-- Invoice summary with order and customer details
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_InvoiceSummary' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_InvoiceSummary;
GO

CREATE VIEW dbo.vw_InvoiceSummary
AS
SELECT
    i.Id,
    i.InvoiceNumber,
    i.OrderId,
    o.OrderNumber,
    o.CustomerId,
    c.Code AS CustomerCode,
    c.Name AS CustomerName,
    c.Email AS CustomerEmail,
    i.InvoiceDate,
    i.DueDate,
    i.TotalAmount,
    i.TaxAmount,
    (i.TotalAmount + i.TaxAmount) AS GrossAmount,
    i.Status,
    DATEDIFF(DAY, GETUTCDATE(), i.DueDate) AS DaysUntilDue,
    i.Notes,
    i.CreatedAt,
    ar.PaidAmount,
    (i.TotalAmount + i.TaxAmount - ISNULL(ar.PaidAmount, 0)) AS OutstandingAmount
FROM dbo.Invoices i
INNER JOIN dbo.Orders o ON i.OrderId = o.Id
INNER JOIN dbo.Customers c ON o.CustomerId = c.Id
LEFT JOIN dbo.AccountsReceivable ar ON i.Id = ar.InvoiceId;
GO

---------------------------------------------------------------------
-- View: vw_SalesReport
-- Daily and monthly sales aggregation
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_SalesReport' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_SalesReport;
GO

CREATE VIEW dbo.vw_SalesReport
AS
SELECT
    CAST(o.OrderDate AS DATE) AS SaleDate,
    FORMAT(o.OrderDate, N'yyyy-MM') AS SaleMonth,
    COUNT(DISTINCT o.Id) AS TotalOrders,
    COUNT(DISTINCT o.CustomerId) AS UniqueCustomers,
    SUM(oi.Quantity) AS TotalItemsSold,
    SUM(o.TotalAmount) AS TotalOrderAmount,
    SUM(o.TaxAmount) AS TotalTax,
    SUM(o.DiscountAmount) AS TotalDiscounts,
    SUM(o.TotalAmount + o.TaxAmount - o.DiscountAmount) AS NetRevenue,
    AVG(o.TotalAmount + o.TaxAmount - o.DiscountAmount) AS AverageOrderValue
FROM dbo.Orders o
INNER JOIN dbo.OrderItems oi ON o.Id = oi.OrderId
WHERE o.Status NOT IN ('Cancelled', 'Draft')
GROUP BY CAST(o.OrderDate AS DATE), FORMAT(o.OrderDate, N'yyyy-MM');
GO

---------------------------------------------------------------------
-- View: vw_InventoryValuation
-- Current stock valuation by product and category
---------------------------------------------------------------------
IF EXISTS (SELECT * FROM sys.views WHERE name = N'vw_InventoryValuation' AND schema_id = SCHEMA_ID(N'dbo'))
    DROP VIEW dbo.vw_InventoryValuation;
GO

CREATE VIEW dbo.vw_InventoryValuation
AS
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
    (p.StockQuantity * p.CostPrice) AS TotalCostValue,
    (p.StockQuantity * p.SalePrice) AS TotalRetailValue,
    (p.StockQuantity * (p.SalePrice - p.CostPrice)) AS PotentialProfit,
    CASE WHEN p.StockQuantity <= p.MinStock THEN N'Low Stock' ELSE N'In Stock' END AS StockStatus,
    p.IsActive
FROM dbo.Products p
INNER JOIN dbo.Categories c ON p.CategoryId = c.Id;
GO

---------------------------------------------------------------------
-- Views creation complete
---------------------------------------------------------------------
PRINT N'Views created successfully for EnterpriseManagementDB.';
GO
