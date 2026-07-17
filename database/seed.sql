---------------------------------------------------------------------
-- EnterpriseManagementDB Seed Data
-- Sample data for development and testing
---------------------------------------------------------------------

SET QUOTED_IDENTIFIER ON;
GO

USE EnterpriseManagementDB;
GO

---------------------------------------------------------------------
-- Seed: Roles
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE Id = '00000000-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO dbo.Roles (Id, Name, Description, IsActive)
    VALUES
        ('00000000-0000-0000-0000-000000000001', N'Administrator', N'Full system access with all permissions', 1),
        ('00000000-0000-0000-0000-000000000002', N'Manager', N'Management level access with limited administrative rights', 1),
        ('00000000-0000-0000-0000-000000000003', N'Staff', N'Standard user access for daily operations', 1);
END
GO

---------------------------------------------------------------------
-- Seed: Permissions
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Permissions WHERE Module = N'Users' AND Action = N'View')
BEGIN
    INSERT INTO dbo.Permissions (Name, Description, Module, Action)
    VALUES
        (N'Users.View', N'View users list and details', N'Users', N'View'),
        (N'Users.Create', N'Create new users', N'Users', N'Create'),
        (N'Users.Edit', N'Edit existing users', N'Users', N'Edit'),
        (N'Users.Delete', N'Delete users', N'Users', N'Delete'),
        (N'Roles.View', N'View roles list and details', N'Roles', N'View'),
        (N'Roles.Create', N'Create new roles', N'Roles', N'Create'),
        (N'Roles.Edit', N'Edit existing roles', N'Roles', N'Edit'),
        (N'Roles.Delete', N'Delete roles', N'Roles', N'Delete'),
        (N'Permissions.View', N'View permissions list', N'Permissions', N'View'),
        (N'Permissions.Create', N'Create new permissions', N'Permissions', N'Create'),
        (N'Permissions.Edit', N'Edit existing permissions', N'Permissions', N'Edit'),
        (N'Permissions.Delete', N'Delete permissions', N'Permissions', N'Delete'),
        (N'Customers.View', N'View customers list and details', N'Customers', N'View'),
        (N'Customers.Create', N'Create new customers', N'Customers', N'Create'),
        (N'Customers.Edit', N'Edit existing customers', N'Customers', N'Edit'),
        (N'Customers.Delete', N'Delete customers', N'Customers', N'Delete'),
        (N'Suppliers.View', N'View suppliers list and details', N'Suppliers', N'View'),
        (N'Suppliers.Create', N'Create new suppliers', N'Suppliers', N'Create'),
        (N'Suppliers.Edit', N'Edit existing suppliers', N'Suppliers', N'Edit'),
        (N'Suppliers.Delete', N'Delete suppliers', N'Suppliers', N'Delete'),
        (N'Products.View', N'View products list and details', N'Products', N'View'),
        (N'Products.Create', N'Create new products', N'Products', N'Create'),
        (N'Products.Edit', N'Edit existing products', N'Products', N'Edit'),
        (N'Products.Delete', N'Delete products', N'Products', N'Delete'),
        (N'Categories.View', N'View categories list and details', N'Categories', N'View'),
        (N'Categories.Create', N'Create new categories', N'Categories', N'Create'),
        (N'Categories.Edit', N'Edit existing categories', N'Categories', N'Edit'),
        (N'Categories.Delete', N'Delete categories', N'Categories', N'Delete'),
        (N'Orders.View', N'View orders list and details', N'Orders', N'View'),
        (N'Orders.Create', N'Create new orders', N'Orders', N'Create'),
        (N'Orders.Edit', N'Edit existing orders', N'Orders', N'Edit'),
        (N'Orders.Delete', N'Delete orders', N'Orders', N'Delete'),
        (N'Invoices.View', N'View invoices list and details', N'Invoices', N'View'),
        (N'Invoices.Create', N'Create new invoices', N'Invoices', N'Create'),
        (N'Invoices.Edit', N'Edit existing invoices', N'Invoices', N'Edit'),
        (N'Invoices.Delete', N'Delete invoices', N'Invoices', N'Delete'),
        (N'Inventory.View', N'View inventory records', N'Inventory', N'View'),
        (N'Inventory.Create', N'Create inventory movements', N'Inventory', N'Create'),
        (N'Inventory.Edit', N'Edit inventory records', N'Inventory', N'Edit'),
        (N'Inventory.Delete', N'Delete inventory records', N'Inventory', N'Delete'),
        (N'Finance.View', N'View financial reports and accounts', N'Finance', N'View'),
        (N'Finance.Create', N'Create financial records', N'Finance', N'Create'),
        (N'Finance.Edit', N'Edit financial records', N'Finance', N'Edit'),
        (N'Finance.Delete', N'Delete financial records', N'Finance', N'Delete'),
        (N'Reports.View', N'View system reports and dashboards', N'Reports', N'View'),
        (N'Settings.View', N'View system settings', N'Settings', N'View'),
        (N'Settings.Edit', N'Edit system settings', N'Settings', N'Edit'),
        (N'Audit.View', N'View audit logs', N'Audit', N'View');
END
GO

---------------------------------------------------------------------
-- Seed: RolePermissions
-- Administrator gets ALL permissions
-- Manager gets View, Create, Edit for core modules
-- Staff gets View and Create for Orders, Customers, Products
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.RolePermissions WHERE RoleId = '00000000-0000-0000-0000-000000000001')
BEGIN
    -- Administrator: ALL permissions
    INSERT INTO dbo.RolePermissions (RoleId, PermissionId)
    SELECT '00000000-0000-0000-0000-000000000001', Id FROM dbo.Permissions;

    -- Manager: View, Create, Edit for most modules
    INSERT INTO dbo.RolePermissions (RoleId, PermissionId)
    SELECT '00000000-0000-0000-0000-000000000002', Id FROM dbo.Permissions
    WHERE Action IN ('View', 'Create', 'Edit')
      AND Module NOT IN ('Users', 'Roles', 'Permissions', 'Audit');

    -- Staff: View and Create for Orders, Customers, Products
    INSERT INTO dbo.RolePermissions (RoleId, PermissionId)
    SELECT '00000000-0000-0000-0000-000000000003', Id FROM dbo.Permissions
    WHERE Module IN ('Orders', 'Customers', 'Products')
      AND Action IN ('View', 'Create');
END
GO

---------------------------------------------------------------------
-- Seed: Admin User
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Username = N'admin')
BEGIN
    INSERT INTO dbo.Users (Username, Email, PasswordHash, FirstName, LastName, RoleId, IsActive)
    VALUES (N'admin', N'admin@enterprise.com', N'$2a$11$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZIg7J6Cx', N'Admin', N'User', '00000000-0000-0000-0000-000000000001', 1);
END
GO

---------------------------------------------------------------------
-- Seed: Customers
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE Code = N'CUST-001')
BEGIN
    INSERT INTO dbo.Customers (Code, Name, Email, Phone, Address, City, State, ZipCode, Country, TaxId, IsActive)
    VALUES
        (N'CUST-001', N'Acme Corporation', N'contact@acme.com', N'+1-555-0101', N'123 Business Ave', N'New York', N'NY', N'10001', N'USA', N'US-123456789', 1),
        (N'CUST-002', N'Global Tech Solutions', N'info@globaltech.com', N'+1-555-0102', N'456 Tech Park', N'San Francisco', N'CA', N'94102', N'USA', N'US-987654321', 1),
        (N'CUST-003', N'Summit Industries', N'sales@summitind.com', N'+1-555-0103', N'789 Industrial Blvd', N'Chicago', N'IL', N'60601', N'USA', N'US-456789123', 1),
        (N'CUST-004', N'Pacific Rim Traders', N'orders@pacificrim.com', N'+1-555-0104', N'321 Commerce St', N'Los Angeles', N'CA', N'90001', N'USA', N'US-321654987', 1),
        (N'CUST-005', N'Northwind Energy', N'procurement@northwind.com', N'+1-555-0105', N'654 Energy Dr', N'Houston', N'TX', N'77001', N'USA', N'US-654987321', 1);
END
GO

---------------------------------------------------------------------
-- Seed: CustomerContacts
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.CustomerContacts WHERE CustomerId IN (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-001'))
BEGIN
    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'John Smith', N'john.smith@acme.com', N'+1-555-1001', N'Procurement Manager', 1 FROM dbo.Customers WHERE Code = N'CUST-001';
    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'Sarah Johnson', N'sarah.j@acme.com', N'+1-555-1002', N'Account Manager', 0 FROM dbo.Customers WHERE Code = N'CUST-001';

    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'Michael Chen', N'm.chen@globaltech.com', N'+1-555-2001', N'CTO', 1 FROM dbo.Customers WHERE Code = N'CUST-002';

    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'Emily Davis', N'e.davis@summitind.com', N'+1-555-3001', N'Operations Director', 1 FROM dbo.Customers WHERE Code = N'CUST-003';

    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'Robert Wilson', N'r.wilson@pacificrim.com', N'+1-555-4001', N'Sales Manager', 1 FROM dbo.Customers WHERE Code = N'CUST-004';

    INSERT INTO dbo.CustomerContacts (CustomerId, Name, Email, Phone, Position, IsPrimary)
    SELECT Id, N'Lisa Anderson', N'l.anderson@northwind.com', N'+1-555-5001', N'Supply Chain Lead', 1 FROM dbo.Customers WHERE Code = N'CUST-005';
END
GO

---------------------------------------------------------------------
-- Seed: Suppliers
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Suppliers WHERE Code = N'SUP-001')
BEGIN
    INSERT INTO dbo.Suppliers (Code, Name, Email, Phone, Address, City, State, ZipCode, Country, TaxId, IsActive)
    VALUES
        (N'SUP-001', N'TechParts Inc', N'sales@techparts.com', N'+1-555-6001', N'100 Component Way', N'Austin', N'TX', N'78701', N'USA', N'US-TP123456', 1),
        (N'SUP-002', N'Office Essentials Ltd', N'orders@officeessentials.com', N'+1-555-6002', N'200 Supply Chain Rd', N'Denver', N'CO', N'80201', N'USA', N'US-OE789012', 1),
        (N'SUP-003', N'Raw Materials Co', N'procurement@rawmatco.com', N'+1-555-6003', N'300 Factory St', N'Detroit', N'MI', N'48201', N'USA', N'US-RM345678', 1),
        (N'SUP-004', N'Global Packaging Solutions', N'info@globalpackaging.com', N'+1-555-6004', N'400 Box Ave', N'Seattle', N'WA', N'98101', N'USA', N'US-GP901234', 1),
        (N'SUP-005', N'Quality Components', N'support@qualitycomp.com', N'+1-555-6005', N'500 Quality Dr', N'Boston', N'MA', N'02101', N'USA', N'US-QC567890', 1);
END
GO

---------------------------------------------------------------------
-- Seed: Categories
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Code = N'CAT-001')
BEGIN
    INSERT INTO dbo.Categories (Code, Name, Description, IsActive)
    VALUES
        (N'CAT-001', N'Electronics', N'Electronic devices, components, and accessories', 1),
        (N'CAT-002', N'Furniture', N'Office and industrial furniture', 1),
        (N'CAT-003', N'Clothing', N'Workwear and protective clothing', 1),
        (N'CAT-004', N'Office Supplies', N'General office supplies and stationery', 1);
END
GO

---------------------------------------------------------------------
-- Seed: Products
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Code = N'PROD-001')
BEGIN
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-001', N'Laptop Computer', N'High-performance business laptop with 16GB RAM and 512GB SSD', Id, 650.00, 899.99, 25, 5, N'LP-001-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-001';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-002', N'Wireless Mouse', N'Ergonomic wireless mouse with USB receiver', Id, 12.00, 24.99, 150, 20, N'WM-002-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-001';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-003', N'Office Chair', N'Ergonomic mesh office chair with lumbar support', Id, 180.00, 349.99, 30, 5, N'OC-003-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-002';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-004', N'Standing Desk', N'Height-adjustable standing desk with memory presets', Id, 450.00, 799.99, 12, 3, N'SD-004-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-002';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-005', N'Safety Vest', N'High-visibility safety vest with reflective strips', Id, 8.50, 19.99, 200, 50, N'SV-005-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-003';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-006', N'Work Boots', N'Steel-toe work boots with slip-resistant soles', Id, 75.00, 149.99, 40, 10, N'WB-006-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-003';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-007', N'Paper Reams', N'Premium quality copy paper, 500 sheets per ream', Id, 4.50, 8.99, 500, 100, N'PR-007-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-004';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-008', N'Pen Set', N'Professional ballpoint pen set, 12 pack', Id, 3.00, 7.99, 300, 50, N'PS-008-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-004';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-009', N'USB-C Hub', N'7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', Id, 18.00, 39.99, 80, 15, N'UH-009-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-001';
    INSERT INTO dbo.Products (Code, Name, Description, CategoryId, CostPrice, SalePrice, StockQuantity, MinStock, Barcode, IsActive)
    SELECT N'PROD-010', N'Filing Cabinet', N'4-drawer vertical filing cabinet with lock', Id, 95.00, 189.99, 18, 4, N'FC-010-2024', 1 FROM dbo.Categories WHERE Code = N'CAT-002';
END
GO

---------------------------------------------------------------------
-- Seed: CompanySettings
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.CompanySettings WHERE [Key] = N'CompanyName')
BEGIN
    INSERT INTO dbo.CompanySettings ([Key], Value, Description)
    VALUES
        (N'CompanyName', N'Enterprise Management Inc', N'Legal name of the company'),
        (N'CompanyAddress', N'100 Enterprise Plaza, Suite 500', N'Primary business address'),
        (N'CompanyCity', N'New York', N'City'),
        (N'CompanyState', N'NY', N'State'),
        (N'CompanyZip', N'10001', N'ZIP code'),
        (N'CompanyCountry', N'USA', N'Country'),
        (N'CompanyPhone', N'+1-555-0000', N'Main phone number'),
        (N'CompanyEmail', N'info@enterprise.com', N'Primary contact email'),
        (N'Currency', N'USD', N'Default currency'),
        (N'CurrencySymbol', N'$', N'Currency symbol'),
        (N'TaxRate', N'8.5', N'Default tax rate percentage'),
        (N'InvoicePrefix', N'INV-', N'Invoice number prefix'),
        (N'OrderPrefix', N'ORD-', N'Order number prefix'),
        (N'FiscalYearStart', N'01-01', N'Fiscal year start month-day'),
        (N'TimeZone', N'Eastern Standard Time', N'Default timezone');
END
GO

---------------------------------------------------------------------
-- Seed: Inventory Movements
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Inventory WHERE ProductId IN (SELECT Id FROM dbo.Products WHERE Code = N'PROD-001'))
BEGIN
    DECLARE @UserId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Users WHERE Username = N'admin');

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 50, N'PO-2024-001', N'Initial stock purchase', @UserId FROM dbo.Products WHERE Code = N'PROD-001';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Sale', -25, N'Initial sales', N'Sales from initial stock', @UserId FROM dbo.Products WHERE Code = N'PROD-001';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 200, N'PO-2024-002', N'Bulk purchase order', @UserId FROM dbo.Products WHERE Code = N'PROD-002';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 50, N'PO-2024-003', N'Initial stock purchase', @UserId FROM dbo.Products WHERE Code = N'PROD-003';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Sale', -20, N'Initial sales', N'Furniture sales', @UserId FROM dbo.Products WHERE Code = N'PROD-003';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 20, N'PO-2024-004', N'Initial stock purchase', @UserId FROM dbo.Products WHERE Code = N'PROD-004';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Return', 2, N'RET-001', N'Customer return adjustment', @UserId FROM dbo.Products WHERE Code = N'PROD-004';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 250, N'PO-2024-005', N'Bulk safety equipment order', @UserId FROM dbo.Products WHERE Code = N'PROD-005';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 60, N'PO-2024-006', N'Work boots bulk purchase', @UserId FROM dbo.Products WHERE Code = N'PROD-006';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Sale', -20, N'Initial sales', N'Work boots sales', @UserId FROM dbo.Products WHERE Code = N'PROD-006';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 600, N'PO-2024-007', N'Paper bulk order', @UserId FROM dbo.Products WHERE Code = N'PROD-007';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 350, N'PO-2024-008', N'Pen set bulk order', @UserId FROM dbo.Products WHERE Code = N'PROD-008';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 100, N'PO-2024-009', N'USB hub bulk order', @UserId FROM dbo.Products WHERE Code = N'PROD-009';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Sale', -20, N'Initial sales', N'USB hub sales', @UserId FROM dbo.Products WHERE Code = N'PROD-009';

    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Purchase', 25, N'PO-2024-010', N'Filing cabinet initial stock', @UserId FROM dbo.Products WHERE Code = N'PROD-010';
    INSERT INTO dbo.Inventory (ProductId, MovementType, Quantity, Reference, Notes, CreatedBy)
    SELECT Id, N'Sale', -7, N'Initial sales', N'Filing cabinet sales', @UserId FROM dbo.Products WHERE Code = N'PROD-010';
END
GO

---------------------------------------------------------------------
-- Seed: Sample Orders
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-001')
BEGIN
    DECLARE @Customer1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-001');
    DECLARE @Customer2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-002');
    DECLARE @Product1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Products WHERE Code = N'PROD-001');
    DECLARE @Product2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Products WHERE Code = N'PROD-002');
    DECLARE @Product3Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Products WHERE Code = N'PROD-003');

    INSERT INTO dbo.Orders (OrderNumber, CustomerId, OrderDate, TotalAmount, TaxAmount, DiscountAmount, Status, Notes)
    VALUES
        (N'ORD-2024-001', @Customer1Id, DATEADD(DAY, -15, GETUTCDATE()), 949.98, 80.75, 0.00, N'Delivered', N'Priority shipping requested'),
        (N'ORD-2024-002', @Customer2Id, DATEADD(DAY, -10, GETUTCDATE()), 349.99, 29.75, 10.00, N'Shipped', N'Gift wrap requested'),
        (N'ORD-2024-003', @Customer1Id, DATEADD(DAY, -5, GETUTCDATE()), 1249.97, 106.25, 50.00, N'Processing', N'Rush order');

    INSERT INTO dbo.OrderItems (OrderId, ProductId, Quantity, UnitPrice, Discount, TotalPrice)
    SELECT Id, @Product1Id, 1, 899.99, 0, 899.99 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-001';
    INSERT INTO dbo.OrderItems (OrderId, ProductId, Quantity, UnitPrice, Discount, TotalPrice)
    SELECT Id, @Product2Id, 2, 24.99, 0, 49.98 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-001';

    INSERT INTO dbo.OrderItems (OrderId, ProductId, Quantity, UnitPrice, Discount, TotalPrice)
    SELECT Id, @Product3Id, 1, 349.99, 10.00, 339.99 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-002';

    INSERT INTO dbo.OrderItems (OrderId, ProductId, Quantity, UnitPrice, Discount, TotalPrice)
    SELECT Id, @Product1Id, 1, 899.99, 0, 899.99 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-003';
    INSERT INTO dbo.OrderItems (OrderId, ProductId, Quantity, UnitPrice, Discount, TotalPrice)
    SELECT Id, @Product3Id, 1, 349.99, 0, 349.99 FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-003';
END
GO

---------------------------------------------------------------------
-- Seed: Sample Invoices
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.Invoices WHERE InvoiceNumber = N'INV-2024-001')
BEGIN
    DECLARE @Order1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-001');
    DECLARE @Order2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-002');

    INSERT INTO dbo.Invoices (InvoiceNumber, OrderId, InvoiceDate, DueDate, TotalAmount, TaxAmount, Status, Notes)
    VALUES
        (N'INV-2024-001', @Order1Id, DATEADD(DAY, -15, GETUTCDATE()), DATEADD(DAY, 15, GETUTCDATE()), 949.98, 80.75, N'Paid', N'Paid via wire transfer'),
        (N'INV-2024-002', @Order2Id, DATEADD(DAY, -10, GETUTCDATE()), DATEADD(DAY, 10, GETUTCDATE()), 349.99, 29.75, N'Sent', N'Sent via email');
END
GO

---------------------------------------------------------------------
-- Seed: Accounts Receivable
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.AccountsReceivable WHERE InvoiceId IN (SELECT Id FROM dbo.Invoices WHERE InvoiceNumber = N'INV-2024-001'))
BEGIN
    DECLARE @Customer1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-001');
    DECLARE @Customer2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-002');
    DECLARE @Inv1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Invoices WHERE InvoiceNumber = N'INV-2024-001');
    DECLARE @Inv2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Invoices WHERE InvoiceNumber = N'INV-2024-002');

    INSERT INTO dbo.AccountsReceivable (CustomerId, InvoiceId, Amount, DueDate, PaidAmount, Status, PaymentDate)
    VALUES
        (@Customer1Id, @Inv1Id, 1030.73, DATEADD(DAY, 15, GETUTCDATE()), 1030.73, N'Paid', DATEADD(DAY, -2, GETUTCDATE())),
        (@Customer2Id, @Inv2Id, 379.74, DATEADD(DAY, 10, GETUTCDATE()), 0.00, N'Pending', NULL);
END
GO

---------------------------------------------------------------------
-- Seed: Accounts Payable
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.AccountsPayable WHERE SupplierId IN (SELECT Id FROM dbo.Suppliers WHERE Code = N'SUP-001'))
BEGIN
    DECLARE @Supplier1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Suppliers WHERE Code = N'SUP-001');
    DECLARE @Supplier2Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Suppliers WHERE Code = N'SUP-002');
    DECLARE @Inv1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Invoices WHERE InvoiceNumber = N'INV-2024-001');

    INSERT INTO dbo.AccountsPayable (SupplierId, InvoiceId, Amount, DueDate, PaidAmount, Status, PaymentDate)
    VALUES
        (@Supplier1Id, @Inv1Id, 5000.00, DATEADD(DAY, 30, GETUTCDATE()), 0.00, N'Pending', NULL),
        (@Supplier2Id, @Inv1Id, 1200.00, DATEADD(DAY, 20, GETUTCDATE()), 600.00, N'Partial', DATEADD(DAY, -5, GETUTCDATE()));
END
GO

---------------------------------------------------------------------
-- Seed: AuditLogs
---------------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.AuditLogs)
BEGIN
    DECLARE @AdminId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Users WHERE Username = N'admin');
    DECLARE @Customer1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Customers WHERE Code = N'CUST-001');
    DECLARE @Product1Id UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Products WHERE Code = N'PROD-001');

    INSERT INTO dbo.AuditLogs (UserId, Action, EntityType, EntityId, OldValues, NewValues, IpAddress, UserAgent)
    VALUES
        (@AdminId, N'Create', N'User', @AdminId, NULL, N'{"Username":"admin","Email":"admin@enterprise.com","RoleId":"00000000-0000-0000-0000-000000000001"}', N'192.168.1.100', N'Mozilla/5.0'),
        (@AdminId, N'Create', N'Customer', @Customer1Id, NULL, N'{"Code":"CUST-001","Name":"Acme Corporation"}', N'192.168.1.100', N'Mozilla/5.0'),
        (@AdminId, N'Create', N'Product', @Product1Id, NULL, N'{"Code":"PROD-001","Name":"Laptop Computer"}', N'192.168.1.100', N'Mozilla/5.0'),
        (@AdminId, N'Update', N'Product', @Product1Id, N'{"StockQuantity":50}', N'{"StockQuantity":25}', N'192.168.1.100', N'Mozilla/5.0'),
        (@AdminId, N'Create', N'Order', (SELECT Id FROM dbo.Orders WHERE OrderNumber = N'ORD-2024-001'), NULL, N'{"OrderNumber":"ORD-2024-001","Status":"Pending"}', N'192.168.1.100', N'Mozilla/5.0');
END
GO

---------------------------------------------------------------------
-- Seed data complete
---------------------------------------------------------------------
PRINT N'Seed data inserted successfully for EnterpriseManagementDB.';
GO
