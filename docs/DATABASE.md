# Database Documentation

This document describes the **Enterprise Management System (EMS)** database: its structure, tables, relationships, constraints, and operational procedures. EMS uses **Microsoft SQL Server** with **Entity Framework Core 9** migrations.

---

## Table of Contents

- [Database Overview](#database-overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Table Descriptions](#table-descriptions)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Seed Data](#seed-data)
- [Backup Strategy](#backup-strategy)
- [Maintenance Plan](#maintenance-plan)
- [Performance Tuning](#performance-tuning)

---

## Database Overview

- **Engine:** Microsoft SQL Server 2019+ (Express/Developer/Standard). LocalDB for development.
- **Name:** `EMS`
- **Collation:** `SQL_Latin1_General_CP1_CI_AS` (case-insensitive).
- **ORM:** Entity Framework Core 9 (Code First, migrations).
- **Identity model:** GUID (`uniqueidentifier`) primary keys generated in application code.
- **Auditing:** `CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy` columns on most tables.
- **Soft delete:** most business entities use an `IsDeleted` flag rather than physical deletion.

There are **18 core tables** spanning identity, parties (customers/suppliers), catalog, transactions (orders/invoices/inventory), finance, and system (audit/settings).

---

## Entity Relationship Diagram

Text-based ERD (relationships shown as `──<` one-to-many):

```
Users ──< UserRoles >── Roles ──< RolePermissions >── Permissions
  │
  ├──< AuditLogs
  │
Customers ──< CustomerContacts
  │
Suppliers
  │
Categories ──< Products
  │
Products ──< OrderItems  <── Orders ──< Invoices ──< InvoicePayments
  │            │
  └────────────┘
Products ──< InventoryMovements
  │
Orders ──< InventoryMovements (reference)
Suppliers ──< InventoryMovements (reference)
  │
Settings (single company row)
  │
FinanceTransactions  (payable / receivable / cash)
```

**Legend:** `──<` = "one parent, many children".

---

## Table Descriptions

### 1. Users
Stores application accounts.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| FullName | nvarchar(200) | No | |
| Email | nvarchar(256) | No | Unique |
| PasswordHash | nvarchar(512) | No | Argon2/bcrypt hash |
| Phone | nvarchar(50) | Yes | |
| IsActive | bit | No | Default 1 |
| LastLoginAt | datetime2 | Yes | |
| CreatedAt | datetime2 | No | |
| CreatedBy | uniqueidentifier | Yes | |
| UpdatedAt | datetime2 | Yes | |
| UpdatedBy | uniqueidentifier | Yes | |
| IsDeleted | bit | No | Default 0 |

### 2. Roles
Named permission groups.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Name | nvarchar(100) | No | Unique |
| Description | nvarchar(500) | Yes | |
| IsSystem | bit | No | Default 0 (system roles protected) |
| CreatedAt | datetime2 | No | |

### 3. Permissions
Granular permission definitions (e.g., `Orders.Create`).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Name | nvarchar(100) | No | Unique |
| Module | nvarchar(100) | No | Grouping |
| Description | nvarchar(500) | Yes | |

### 4. UserRoles (join)
Maps users to roles (many-to-many).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| UserId | uniqueidentifier | No | PK/FK → Users |
| RoleId | uniqueidentifier | No | PK/FK → Roles |

### 5. RolePermissions (join)
Maps roles to permissions (many-to-many).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| RoleId | uniqueidentifier | No | PK/FK → Roles |
| PermissionId | uniqueidentifier | No | PK/FK → Permissions |

### 6. Customers
Customer organizations.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Name | nvarchar(200) | No | |
| TaxId | nvarchar(50) | Yes | |
| Email | nvarchar(256) | Yes | |
| Phone | nvarchar(50) | Yes | |
| Address | nvarchar(500) | Yes | |
| CreditLimit | decimal(18,2) | No | Default 0 |
| PaymentTermsDays | int | No | Default 30 |
| Balance | decimal(18,2) | No | Denormalized, maintained by triggers/jobs |
| CreatedAt | datetime2 | No | |
| IsDeleted | bit | No | Default 0 |

### 7. CustomerContacts
Contacts belonging to a customer.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| CustomerId | uniqueidentifier | No | FK → Customers |
| Name | nvarchar(200) | No | |
| Email | nvarchar(256) | Yes | |
| Phone | nvarchar(50) | Yes | |
| Role | nvarchar(100) | Yes | |
| IsPrimary | bit | No | Default 0 |

### 8. Suppliers
Supplier organizations.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Name | nvarchar(200) | No | |
| TaxId | nvarchar(50) | Yes | |
| Email | nvarchar(256) | Yes | |
| Phone | nvarchar(50) | Yes | |
| Address | nvarchar(500) | Yes | |
| PaymentTermsDays | int | No | Default 30 |
| CreatedAt | datetime2 | No | |
| IsDeleted | bit | No | Default 0 |

### 9. Categories
Product categories (self-referencing for nesting).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Name | nvarchar(100) | No | |
| ParentId | uniqueidentifier | Yes | FK → Categories (nullable) |
| IsDeleted | bit | No | Default 0 |

### 10. Products
Catalog items.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Sku | nvarchar(50) | No | Unique |
| Name | nvarchar(200) | No | |
| Description | nvarchar(1000) | Yes | |
| CategoryId | uniqueidentifier | Yes | FK → Categories |
| UnitOfMeasure | nvarchar(20) | No | |
| PurchasePrice | decimal(18,2) | No | |
| SalePrice | decimal(18,2) | No | |
| ReorderLevel | int | No | Default 0 |
| Stock | int | No | Current on-hand |
| ImageUrl | nvarchar(500) | Yes | |
| IsDeleted | bit | No | Default 0 |

### 11. Orders
Sales orders.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| OrderNumber | nvarchar(50) | No | Unique |
| CustomerId | uniqueidentifier | No | FK → Customers |
| OrderDate | datetime2 | No | |
| Status | nvarchar(20) | No | Draft/Confirmed/Processing/Completed/Cancelled |
| SubTotal | decimal(18,2) | No | |
| TaxRate | decimal(5,2) | No | |
| TaxAmount | decimal(18,2) | No | |
| Total | decimal(18,2) | No | |
| Notes | nvarchar(1000) | Yes | |
| CreatedBy | uniqueidentifier | No | FK → Users |
| CreatedAt | datetime2 | No | |
| IsDeleted | bit | No | Default 0 |

### 12. OrderItems
Line items for an order.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| OrderId | uniqueidentifier | No | FK → Orders |
| ProductId | uniqueidentifier | No | FK → Products |
| Quantity | int | No | |
| UnitPrice | decimal(18,2) | No | |
| LineTotal | decimal(18,2) | No | Quantity * UnitPrice |

### 13. Invoices
Issued invoices.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| InvoiceNumber | nvarchar(50) | No | Unique |
| OrderId | uniqueidentifier | Yes | FK → Orders |
| CustomerId | uniqueidentifier | No | FK → Customers |
| IssueDate | datetime2 | No | |
| DueDate | datetime2 | No | |
| SubTotal | decimal(18,2) | No | |
| TaxAmount | decimal(18,2) | No | |
| Total | decimal(18,2) | No | |
| PaidAmount | decimal(18,2) | No | Default 0 |
| Status | nvarchar(20) | No | Unpaid/Partial/Paid/Overdue |
| Notes | nvarchar(1000) | Yes | |
| CreatedAt | datetime2 | No | |

### 14. InvoicePayments
Payments applied to invoices.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| InvoiceId | uniqueidentifier | No | FK → Invoices |
| Amount | decimal(18,2) | No | |
| Method | nvarchar(20) | No | Cash/Transfer/Card |
| PaymentDate | datetime2 | No | |
| CreatedAt | datetime2 | No | |

### 15. InventoryMovements
Stock entry/exit history.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| ProductId | uniqueidentifier | No | FK → Products |
| Type | nvarchar(10) | No | Entry/Exit |
| Quantity | int | No | Signed magnitude (always positive) |
| Reference | nvarchar(100) | Yes | Order/PO/invoice ref |
| SupplierId | uniqueidentifier | Yes | FK → Suppliers (entries) |
| OrderId | uniqueidentifier | Yes | FK → Orders (exits) |
| Reason | nvarchar(100) | Yes | |
| CreatedBy | uniqueidentifier | No | FK → Users |
| CreatedAt | datetime2 | No | |

### 16. FinanceTransactions
General financial ledger rows (payable/receivable/cash).

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Type | nvarchar(20) | No | Payable/Receivable/CashIn/CashOut |
| ReferenceId | uniqueidentifier | Yes | Links to invoice/order/supplier |
| Amount | decimal(18,2) | No | |
| Direction | nvarchar(10) | No | In/Out |
| TransactionDate | datetime2 | No | |
| Description | nvarchar(500) | Yes | |
| CreatedAt | datetime2 | No | |

### 17. Settings
Single company configuration row.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| CompanyName | nvarchar(200) | No | |
| TaxId | nvarchar(50) | Yes | |
| Address | nvarchar(500) | Yes | |
| Phone | nvarchar(50) | Yes | |
| Email | nvarchar(256) | Yes | |
| LogoUrl | nvarchar(500) | Yes | |
| DefaultCurrency | nvarchar(10) | No | Default 'USD' |
| DefaultTaxRate | decimal(5,2) | No | |
| Theme | nvarchar(20) | No | Light/Dark |

### 18. AuditLogs
Immutable security/data event log.

| Column | Type | Null | Notes |
| --- | --- | --- | --- |
| Id | uniqueidentifier | No | PK |
| Timestamp | datetime2 | No | |
| UserId | uniqueidentifier | Yes | FK → Users |
| Action | nvarchar(50) | No | Login/Create/Update/Delete/etc. |
| Entity | nvarchar(100) | Yes | |
| EntityId | nvarchar(100) | Yes | |
| IpAddress | nvarchar(50) | Yes | |
| Detail | nvarchar(1000) | Yes | |

---

## Relationships

| Child | Parent | FK | On Delete |
| --- | --- | --- | --- |
| UserRoles | Users | UserId | Cascade |
| UserRoles | Roles | RoleId | Cascade |
| RolePermissions | Roles | RoleId | Cascade |
| RolePermissions | Permissions | PermissionId | Cascade |
| CustomerContacts | Customers | CustomerId | Cascade |
| Categories | Categories | ParentId | Restrict (no orphan nesting) |
| Products | Categories | CategoryId | Set Null |
| Orders | Customers | CustomerId | Restrict |
| OrderItems | Orders | OrderId | Cascade |
| OrderItems | Products | ProductId | Restrict |
| Invoices | Orders | OrderId | Restrict |
| Invoices | Customers | CustomerId | Restrict |
| InvoicePayments | Invoices | InvoiceId | Cascade |
| InventoryMovements | Products | ProductId | Restrict |
| InventoryMovements | Suppliers | SupplierId | Set Null |
| InventoryMovements | Orders | OrderId | Set Null |
| AuditLogs | Users | UserId | Set Null |

---

## Indexes

Recommended/auto-created indexes:

| Table | Index | Columns |
| --- | --- | --- |
| Users | UQ_Users_Email | Email (unique) |
| Roles | UQ_Roles_Name | Name (unique) |
| Permissions | UQ_Permissions_Name | Name (unique) |
| Customers | IX_Customers_Name | Name |
| Products | UQ_Products_Sku | Sku (unique) |
| Products | IX_Products_Category | CategoryId |
| Orders | IX_Orders_Customer | CustomerId |
| Orders | IX_Orders_Status_Date | Status, OrderDate |
| OrderItems | IX_OrderItems_Order | OrderId |
| Invoices | UQ_Invoices_Number | InvoiceNumber (unique) |
| Invoices | IX_Invoices_Customer | CustomerId |
| Invoices | IX_Invoices_Status_Due | Status, DueDate |
| InvoicePayments | IX_Payments_Invoice | InvoiceId |
| InventoryMovements | IX_Movements_Product_Date | ProductId, CreatedAt |
| FinanceTransactions | IX_Finance_Date_Type | TransactionDate, Type |
| AuditLogs | IX_Audit_Timestamp | Timestamp |
| AuditLogs | IX_Audit_User | UserId |

---

## Constraints

- **Primary keys:** all `Id` columns (`uniqueidentifier`, clustered).
- **Foreign keys:** as listed in Relationships.
- **Unique constraints:** Email, Role.Name, Permission.Name, Product.Sku, Order.OrderNumber, Invoice.InvoiceNumber.
- **Check constraints:** `Orders.Status IN (...)`, `Invoices.Status IN (...)`, `InventoryMovements.Type IN ('Entry','Exit')`, `FinanceTransactions.Direction IN ('In','Out')`, non-negative monetary columns.
- **Default constraints:** `IsDeleted=0`, `IsActive=1`, `PaymentTermsDays=30`, timestamps defaulting to `SYSUTCDATETIME()`.

---

## Seed Data

The seed routine (`dotnet run --seed`) creates:

1. **Permissions** — one row per module action (e.g., `Users.View`, `Orders.Create`).
2. **Roles** — `Admin` (all permissions, `IsSystem=1`) and `User` (read-only subset).
3. **Admin user** — `admin@ems.local` / `Admin@12345` (hashed), assigned `Admin`.
4. **Settings** — a single default company row.
5. **Sample reference data** (optional flag) — a few customers, suppliers, categories, and products so the dashboard renders immediately.

> Seed is idempotent: re-running does not duplicate system rows.

---

## Backup Strategy

- **Full backup:** nightly (`BACKUP DATABASE [EMS] TO DISK = ...`).
- **Differential:** every 6 hours.
- **Transaction log:** every 15 minutes (FULL recovery model).
- **Retention:** 30 days online, 12 months archived to cold storage.
- **Restore test:** quarterly restore drill to verify integrity.
- **Docker:** mount a named volume for `/var/opt/mssql` and snapshot it, or use `sqlcmd` to back up to a mounted host path.

Example:

```sql
BACKUP DATABASE [EMS]
TO DISK = N'/var/opt/mssql/backups/ems_full.bak'
WITH COMPRESSION, STATS = 10;
```

---

## Maintenance Plan

- **Index maintenance:** `REORGANIZE` weekly, `REBUILD` monthly for fragmented indexes (>30%).
- **Statistics:** auto-update on; manual `UPDATE STATISTICS` after large bulk loads.
- **Integrity check:** `DBCC CHECKDB` weekly.
- **Audit log pruning:** archive rows older than 24 months to a history table.
- **Inventory balance reconciliation:** nightly job to recompute `Customer.Balance` and verify `Product.Stock` against `InventoryMovements`.

---

## Performance Tuning

- Keep covering indexes for the most common list filters (`Status`, date ranges).
- Use **pagination** on all list endpoints (avoid `SELECT *` without `OFFSET/FETCH`).
- Maintain the `Customer.Balance` denormalized column via a nightly job rather than computing on every read.
- Enable **query store** to capture regressions.
- For reporting, consider scheduled materialized aggregates (sales/day) instead of scanning raw tables.
- Set `TrustServerCertificate=True` only in dev; use a real cert and encrypted connections in production.
