---------------------------------------------------------------------
-- EnterpriseManagementDB Schema
-- Complete database schema for Enterprise Management System
-- Database: EnterpriseManagementDB
-- Schema: dbo
-- Collation: SQL_Latin1_General_CP1_CI_AS
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

---------------------------------------------------------------------
-- Create Database
---------------------------------------------------------------------
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'EnterpriseManagementDB')
BEGIN
    CREATE DATABASE EnterpriseManagementDB
    COLLATE SQL_Latin1_General_CP1_CI_AS;
END
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Tables: Roles and Permissions (Security Foundation)
---------------------------------------------------------------------

-- 1. Roles
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Roles' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Roles
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(500) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 2. Permissions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Permissions' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Permissions
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        Module NVARCHAR(100) NOT NULL,
        Action NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_Permission_Module_Action UNIQUE (Module, Action)
    );
END
GO

-- 3. RolePermissions (Many-to-Many)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'RolePermissions' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.RolePermissions
    (
        RoleId UNIQUEIDENTIFIER NOT NULL,
        PermissionId UNIQUEIDENTIFIER NOT NULL,
        AssignedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT PK_RolePermissions PRIMARY KEY (RoleId, PermissionId),
        CONSTRAINT FK_RolePermissions_RoleId FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id) ON DELETE CASCADE,
        CONSTRAINT FK_RolePermissions_PermissionId FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(Id) ON DELETE CASCADE
    );
END
GO

---------------------------------------------------------------------
-- Table: Users
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Users' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Users
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Username NVARCHAR(100) NOT NULL UNIQUE,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(500) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(20) NULL,
        RoleId UNIQUEIDENTIFIER NOT NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        LastLoginAt DATETIME2 NULL,
        CONSTRAINT FK_Users_RoleId FOREIGN KEY (RoleId) REFERENCES dbo.Roles(Id)
    );
END
GO

---------------------------------------------------------------------
-- Tables: Customers and Contacts
---------------------------------------------------------------------

-- 5. Customers
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Customers' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Customers
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Email NVARCHAR(255) NULL,
        Phone NVARCHAR(20) NULL,
        Address NVARCHAR(500) NULL,
        City NVARCHAR(100) NULL,
        State NVARCHAR(100) NULL,
        ZipCode NVARCHAR(20) NULL,
        Country NVARCHAR(100) NOT NULL DEFAULT 'USA',
        TaxId NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 6. CustomerContacts
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'CustomerContacts' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.CustomerContacts
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        CustomerId UNIQUEIDENTIFIER NOT NULL,
        Name NVARCHAR(200) NOT NULL,
        Email NVARCHAR(255) NULL,
        Phone NVARCHAR(20) NULL,
        Position NVARCHAR(100) NULL,
        IsPrimary BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_CustomerContacts_CustomerId FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id) ON DELETE CASCADE
    );
END
GO

---------------------------------------------------------------------
-- Table: Suppliers
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Suppliers' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Suppliers
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Email NVARCHAR(255) NULL,
        Phone NVARCHAR(20) NULL,
        Address NVARCHAR(500) NULL,
        City NVARCHAR(100) NULL,
        State NVARCHAR(100) NULL,
        ZipCode NVARCHAR(20) NULL,
        Country NVARCHAR(100) NOT NULL DEFAULT 'USA',
        TaxId NVARCHAR(50) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

---------------------------------------------------------------------
-- Tables: Categories and Products
---------------------------------------------------------------------

-- 8. Categories
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Categories' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Categories
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(1000) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 9. Products
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Products' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Products
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Code NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(200) NOT NULL,
        Description NVARCHAR(2000) NULL,
        CategoryId UNIQUEIDENTIFIER NOT NULL,
        CostPrice DECIMAL(18, 2) NOT NULL,
        SalePrice DECIMAL(18, 2) NOT NULL,
        StockQuantity INT NOT NULL DEFAULT 0,
        MinStock INT NOT NULL DEFAULT 0,
        Barcode NVARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Products_CategoryId FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
        CONSTRAINT CHK_Products_CostPrice CHECK (CostPrice >= 0),
        CONSTRAINT CHK_Products_SalePrice CHECK (SalePrice >= 0),
        CONSTRAINT CHK_Products_StockQuantity CHECK (StockQuantity >= 0),
        CONSTRAINT CHK_Products_MinStock CHECK (MinStock >= 0)
    );
END
GO

---------------------------------------------------------------------
-- Tables: Orders and OrderItems
---------------------------------------------------------------------

-- 10. Orders
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Orders' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Orders
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
        CustomerId UNIQUEIDENTIFIER NOT NULL,
        OrderDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        TotalAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        TaxAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        DiscountAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Orders_CustomerId FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id),
        CONSTRAINT CHK_Orders_Status CHECK (Status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'))
    );
END
GO

-- 11. OrderItems
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'OrderItems' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.OrderItems
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        OrderId UNIQUEIDENTIFIER NOT NULL,
        ProductId UNIQUEIDENTIFIER NOT NULL,
        Quantity INT NOT NULL,
        UnitPrice DECIMAL(18, 2) NOT NULL,
        Discount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        TotalPrice DECIMAL(18, 2) NOT NULL,
        CONSTRAINT FK_OrderItems_OrderId FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
        CONSTRAINT FK_OrderItems_ProductId FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
        CONSTRAINT CHK_OrderItems_Quantity CHECK (Quantity > 0),
        CONSTRAINT CHK_OrderItems_UnitPrice CHECK (UnitPrice >= 0),
        CONSTRAINT CHK_OrderItems_Discount CHECK (Discount >= 0),
        CONSTRAINT CHK_OrderItems_TotalPrice CHECK (TotalPrice >= 0)
    );
END
GO

---------------------------------------------------------------------
-- Table: Invoices
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Invoices' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Invoices
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
        OrderId UNIQUEIDENTIFIER NOT NULL,
        InvoiceDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        DueDate DATETIME2 NOT NULL,
        TotalAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        TaxAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Invoices_OrderId FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id),
        CONSTRAINT CHK_Invoices_Status CHECK (Status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'))
    );
END
GO

---------------------------------------------------------------------
-- Table: Inventory
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'Inventory' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.Inventory
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ProductId UNIQUEIDENTIFIER NOT NULL,
        MovementType NVARCHAR(50) NOT NULL,
        Quantity INT NOT NULL,
        Reference NVARCHAR(200) NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy UNIQUEIDENTIFIER NULL,
        CONSTRAINT FK_Inventory_ProductId FOREIGN KEY (ProductId) REFERENCES dbo.Products(Id),
        CONSTRAINT FK_Inventory_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(Id),
        CONSTRAINT CHK_Inventory_MovementType CHECK (MovementType IN ('Purchase', 'Sale', 'Adjustment', 'Return'))
    );
END
GO

---------------------------------------------------------------------
-- Tables: Accounts Payable and Receivable
---------------------------------------------------------------------

-- 14. AccountsPayable
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'AccountsPayable' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.AccountsPayable
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SupplierId UNIQUEIDENTIFIER NOT NULL,
        InvoiceId UNIQUEIDENTIFIER NOT NULL,
        Amount DECIMAL(18, 2) NOT NULL,
        DueDate DATETIME2 NOT NULL,
        PaidAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        PaymentDate DATETIME2 NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AccountsPayable_SupplierId FOREIGN KEY (SupplierId) REFERENCES dbo.Suppliers(Id),
        CONSTRAINT FK_AccountsPayable_InvoiceId FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoices(Id),
        CONSTRAINT CHK_AccountsPayable_Status CHECK (Status IN ('Pending', 'Partial', 'Paid', 'Overdue')),
        CONSTRAINT CHK_AccountsPayable_PaidAmount CHECK (PaidAmount >= 0)
    );
END
GO

-- 15. AccountsReceivable
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'AccountsReceivable' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.AccountsReceivable
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        CustomerId UNIQUEIDENTIFIER NOT NULL,
        InvoiceId UNIQUEIDENTIFIER NOT NULL,
        Amount DECIMAL(18, 2) NOT NULL,
        DueDate DATETIME2 NOT NULL,
        PaidAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        PaymentDate DATETIME2 NULL,
        Notes NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AccountsReceivable_CustomerId FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(Id),
        CONSTRAINT FK_AccountsReceivable_InvoiceId FOREIGN KEY (InvoiceId) REFERENCES dbo.Invoices(Id),
        CONSTRAINT CHK_AccountsReceivable_Status CHECK (Status IN ('Pending', 'Partial', 'Paid', 'Overdue')),
        CONSTRAINT CHK_AccountsReceivable_PaidAmount CHECK (PaidAmount >= 0)
    );
END
GO

---------------------------------------------------------------------
-- Table: AuditLogs
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'AuditLogs' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.AuditLogs
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId UNIQUEIDENTIFIER NULL,
        Action NVARCHAR(200) NOT NULL,
        EntityType NVARCHAR(200) NOT NULL,
        EntityId UNIQUEIDENTIFIER NULL,
        OldValues NVARCHAR(MAX) NULL,
        NewValues NVARCHAR(MAX) NULL,
        IpAddress NVARCHAR(50) NULL,
        UserAgent NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_AuditLogs_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
    );
END
GO

---------------------------------------------------------------------
-- Table: CompanySettings
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'CompanySettings' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.CompanySettings
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [Key] NVARCHAR(200) NOT NULL UNIQUE,
        Value NVARCHAR(MAX) NULL,
        Description NVARCHAR(500) NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

---------------------------------------------------------------------
-- Table: RefreshTokens
---------------------------------------------------------------------
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = N'RefreshTokens' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
    CREATE TABLE dbo.RefreshTokens
    (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Token NVARCHAR(500) NOT NULL UNIQUE,
        UserId UNIQUEIDENTIFIER NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_RefreshTokens_UserId FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
    );
END
GO

---------------------------------------------------------------------
-- Schema creation complete
---------------------------------------------------------------------
PRINT N'Schema created successfully for EnterpriseManagementDB.';
GO
