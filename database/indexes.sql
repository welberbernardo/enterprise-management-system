---------------------------------------------------------------------
-- EnterpriseManagementDB Indexes
-- Performance indexes for common query patterns
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Indexes for Users table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_Username' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Username
        ON dbo.Users (Username)
        INCLUDE (Email, FirstName, LastName, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_Email' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_Email
        ON dbo.Users (Email)
        INCLUDE (Username, FirstName, LastName, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_RoleId' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_RoleId
        ON dbo.Users (RoleId)
        INCLUDE (Username, FirstName, LastName, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Users_IsActive' AND object_id = OBJECT_ID(N'dbo.Users'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Users_IsActive
        ON dbo.Users (IsActive)
        INCLUDE (Username, Email, FirstName, LastName, RoleId);
END
GO

---------------------------------------------------------------------
-- Indexes for Customers table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Customers_Name' AND object_id = OBJECT_ID(N'dbo.Customers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Customers_Name
        ON dbo.Customers (Name)
        INCLUDE (Code, Email, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Customers_Email' AND object_id = OBJECT_ID(N'dbo.Customers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Customers_Email
        ON dbo.Customers (Email)
        INCLUDE (Name, Code, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Customers_Code' AND object_id = OBJECT_ID(N'dbo.Customers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Customers_Code
        ON dbo.Customers (Code)
        INCLUDE (Name, Email, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Customers_IsActive' AND object_id = OBJECT_ID(N'dbo.Customers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Customers_IsActive
        ON dbo.Customers (IsActive)
        INCLUDE (Name, Code, Email, Phone, City, State);
END
GO

---------------------------------------------------------------------
-- Indexes for Suppliers table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Suppliers_Name' AND object_id = OBJECT_ID(N'dbo.Suppliers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Suppliers_Name
        ON dbo.Suppliers (Name)
        INCLUDE (Code, Email, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Suppliers_Email' AND object_id = OBJECT_ID(N'dbo.Suppliers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Suppliers_Email
        ON dbo.Suppliers (Email)
        INCLUDE (Name, Code, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Suppliers_Code' AND object_id = OBJECT_ID(N'dbo.Suppliers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Suppliers_Code
        ON dbo.Suppliers (Code)
        INCLUDE (Name, Email, Phone, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Suppliers_IsActive' AND object_id = OBJECT_ID(N'dbo.Suppliers'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Suppliers_IsActive
        ON dbo.Suppliers (IsActive)
        INCLUDE (Name, Code, Email, Phone, City, State);
END
GO

---------------------------------------------------------------------
-- Indexes for Products table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Products_CategoryId' AND object_id = OBJECT_ID(N'dbo.Products'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_CategoryId
        ON dbo.Products (CategoryId)
        INCLUDE (Code, Name, CostPrice, SalePrice, StockQuantity, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Products_Name' AND object_id = OBJECT_ID(N'dbo.Products'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_Name
        ON dbo.Products (Name)
        INCLUDE (Code, CategoryId, CostPrice, SalePrice, StockQuantity, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Products_Code' AND object_id = OBJECT_ID(N'dbo.Products'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_Code
        ON dbo.Products (Code)
        INCLUDE (Name, CategoryId, CostPrice, SalePrice, StockQuantity, IsActive);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Products_IsActive' AND object_id = OBJECT_ID(N'dbo.Products'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_IsActive
        ON dbo.Products (IsActive)
        INCLUDE (Code, Name, CategoryId, CostPrice, SalePrice, StockQuantity);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Products_Barcode' AND object_id = OBJECT_ID(N'dbo.Products'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Products_Barcode
        ON dbo.Products (Barcode)
        INCLUDE (Code, Name, CategoryId, CostPrice, SalePrice, StockQuantity);
END
GO

---------------------------------------------------------------------
-- Indexes for Orders table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Orders_CustomerId' AND object_id = OBJECT_ID(N'dbo.Orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Orders_CustomerId
        ON dbo.Orders (CustomerId)
        INCLUDE (OrderNumber, OrderDate, TotalAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Orders_OrderDate' AND object_id = OBJECT_ID(N'dbo.Orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
        ON dbo.Orders (OrderDate)
        INCLUDE (OrderNumber, CustomerId, TotalAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Orders_Status' AND object_id = OBJECT_ID(N'dbo.Orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Orders_Status
        ON dbo.Orders (Status)
        INCLUDE (OrderNumber, CustomerId, OrderDate, TotalAmount);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Orders_OrderNumber' AND object_id = OBJECT_ID(N'dbo.Orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Orders_OrderNumber
        ON dbo.Orders (OrderNumber)
        INCLUDE (CustomerId, OrderDate, TotalAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Orders_CustomerId_OrderDate' AND object_id = OBJECT_ID(N'dbo.Orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Orders_CustomerId_OrderDate
        ON dbo.Orders (CustomerId, OrderDate DESC)
        INCLUDE (OrderNumber, TotalAmount, Status);
END
GO

---------------------------------------------------------------------
-- Indexes for Invoices table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Invoices_OrderId' AND object_id = OBJECT_ID(N'dbo.Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoices_OrderId
        ON dbo.Invoices (OrderId)
        INCLUDE (InvoiceNumber, InvoiceDate, TotalAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Invoices_InvoiceNumber' AND object_id = OBJECT_ID(N'dbo.Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoices_InvoiceNumber
        ON dbo.Invoices (InvoiceNumber)
        INCLUDE (OrderId, InvoiceDate, DueDate, TotalAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Invoices_Status' AND object_id = OBJECT_ID(N'dbo.Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoices_Status
        ON dbo.Invoices (Status)
        INCLUDE (InvoiceNumber, OrderId, InvoiceDate, DueDate, TotalAmount);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Invoices_InvoiceDate' AND object_id = OBJECT_ID(N'dbo.Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoices_InvoiceDate
        ON dbo.Invoices (InvoiceDate)
        INCLUDE (InvoiceNumber, OrderId, DueDate, TotalAmount, Status);
END
GO

---------------------------------------------------------------------
-- Indexes for Inventory table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Inventory_ProductId' AND object_id = OBJECT_ID(N'dbo.Inventory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inventory_ProductId
        ON dbo.Inventory (ProductId)
        INCLUDE (MovementType, Quantity, CreatedAt);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Inventory_MovementType' AND object_id = OBJECT_ID(N'dbo.Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inventory_MovementType
        ON dbo.Inventory (MovementType)
        INCLUDE (ProductId, Quantity, CreatedAt);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Inventory_CreatedAt' AND object_id = OBJECT_ID(N'dbo.Inventory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inventory_CreatedAt
        ON dbo.Inventory (CreatedAt)
        INCLUDE (ProductId, MovementType, Quantity, CreatedBy);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_Inventory_ProductId_MovementType' AND object_id = OBJECT_ID(N'dbo.Inventory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Inventory_ProductId_MovementType
        ON dbo.Inventory (ProductId, MovementType, CreatedAt DESC)
        INCLUDE (Quantity, Reference, CreatedBy);
END
GO

---------------------------------------------------------------------
-- Indexes for AuditLogs table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AuditLogs_UserId' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLogs_UserId
        ON dbo.AuditLogs (UserId)
        INCLUDE (Action, EntityType, EntityId, CreatedAt);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AuditLogs_EntityType' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLogs_EntityType
        ON dbo.AuditLogs (EntityType)
        INCLUDE (UserId, Action, EntityId, CreatedAt);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AuditLogs_CreatedAt' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLogs_CreatedAt
        ON dbo.AuditLogs (CreatedAt DESC)
        INCLUDE (UserId, Action, EntityType, EntityId);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AuditLogs_Action' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLogs_Action
        ON dbo.AuditLogs (Action)
        INCLUDE (UserId, EntityType, EntityId, CreatedAt);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AuditLogs_EntityType_CreatedAt' AND object_id = OBJECT_ID(N'dbo.AuditLogs'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AuditLogs_EntityType_CreatedAt
        ON dbo.AuditLogs (EntityType, CreatedAt DESC)
        INCLUDE (UserId, Action, EntityId);
END
GO

---------------------------------------------------------------------
-- Indexes for AccountsPayable table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsPayable_Status' AND object_id = OBJECT_ID(N'dbo.AccountsPayable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsPayable_Status
        ON dbo.AccountsPayable (Status)
        INCLUDE (SupplierId, DueDate, Amount, PaidAmount);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsPayable_DueDate' AND object_id = OBJECT_ID(N'dbo.AccountsPayable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsPayable_DueDate
        ON dbo.AccountsPayable (DueDate)
        INCLUDE (SupplierId, Amount, PaidAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsPayable_SupplierId' AND object_id = OBJECT_ID(N'dbo.AccountsPayable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsPayable_SupplierId
        ON dbo.AccountsPayable (SupplierId)
        INCLUDE (Amount, DueDate, PaidAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsPayable_Status_DueDate' AND object_id = OBJECT_ID(N'dbo.AccountsPayable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsPayable_Status_DueDate
        ON dbo.AccountsPayable (Status, DueDate)
        INCLUDE (SupplierId, Amount, PaidAmount);
END
GO

---------------------------------------------------------------------
-- Indexes for AccountsReceivable table
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsReceivable_Status' AND object_id = OBJECT_ID(N'dbo.AccountsReceivable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsReceivable_Status
        ON dbo.AccountsReceivable (Status)
        INCLUDE (CustomerId, DueDate, Amount, PaidAmount);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsReceivable_DueDate' AND object_id = OBJECT_ID(N'dbo.AccountsReceivable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsReceivable_DueDate
        ON dbo.AccountsReceivable (DueDate)
        INCLUDE (CustomerId, Amount, PaidAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsReceivable_CustomerId' AND object_id = OBJECT_ID(N'dbo.AccountsReceivable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsReceivable_CustomerId
        ON dbo.AccountsReceivable (CustomerId)
        INCLUDE (Amount, DueDate, PaidAmount, Status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_AccountsReceivable_Status_DueDate' AND object_id = OBJECT_ID(N'dbo.AccountsReceivable'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_AccountsReceivable_Status_DueDate
        ON dbo.AccountsReceivable (Status, DueDate)
        INCLUDE (CustomerId, Amount, PaidAmount);
END
GO

---------------------------------------------------------------------
-- Additional useful indexes
---------------------------------------------------------------------

-- OrderItems: OrderId for joining with Orders
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_OrderItems_OrderId' AND object_id = OBJECT_ID(N'dbo.OrderItems'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId
        ON dbo.OrderItems (OrderId)
        INCLUDE (ProductId, Quantity, UnitPrice, Discount, TotalPrice);
END
GO

-- OrderItems: ProductId for product sales analysis
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_OrderItems_ProductId' AND object_id = OBJECT_ID(N'dbo.OrderItems'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_OrderItems_ProductId
        ON dbo.OrderItems (ProductId)
        INCLUDE (OrderId, Quantity, UnitPrice, Discount, TotalPrice);
END
GO

-- CustomerContacts: CustomerId for contact lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_CustomerContacts_CustomerId' AND object_id = OBJECT_ID(N'dbo.CustomerContacts'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_CustomerContacts_CustomerId
        ON dbo.CustomerContacts (CustomerId)
        INCLUDE (Name, Email, Phone, Position, IsPrimary);
END
GO

-- RefreshTokens: UserId for token lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_RefreshTokens_UserId' AND object_id = OBJECT_ID(N'dbo.RefreshTokens'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId
        ON dbo.RefreshTokens (UserId)
        INCLUDE (Token, ExpiresAt, IsRevoked);
END
GO

-- RefreshTokens: ExpiresAt for cleanup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_RefreshTokens_ExpiresAt' AND object_id = OBJECT_ID(N'dbo.RefreshTokens'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_ExpiresAt
        ON dbo.RefreshTokens (ExpiresAt)
        INCLUDE (UserId, Token, IsRevoked);
END
GO

-- CompanySettings: Key for setting lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = N'IX_CompanySettings_Key' AND object_id = OBJECT_ID(N'dbo.CompanySettings'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_CompanySettings_Key
        ON dbo.CompanySettings ([Key])
        INCLUDE (Value, Description);
END
GO

---------------------------------------------------------------------
-- Indexes creation complete
---------------------------------------------------------------------
PRINT N'Indexes created successfully for EnterpriseManagementDB.';
GO
