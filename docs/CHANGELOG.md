# Changelog

All notable changes to the Enterprise Management System are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-17

### Added

#### Authentication System
- JWT-based authentication with access and refresh tokens.
- Refresh token rotation and revocation.
- Password reset (forgot/reset) and change-password flows.
- Account lockout after repeated failed login attempts.
- Secure password hashing with enforced password policy.

#### User Management
- Create, update, disable, and list users.
- User profile with avatar and security settings.
- Assignment of users to one or more roles.

#### Role-Based Access Control
- Role management (create, update, delete).
- Granular permission definitions grouped by module.
- Permission-to-role and role-to-user mappings.
- Policy-based authorization on all protected endpoints.

#### Customer Management
- Customer records with tax ID, address, credit limit, and payment terms.
- Multiple contacts per customer with a primary-contact flag.
- Denormalized customer balance tracking.

#### Supplier Management
- Supplier records with contacts and payment terms.

#### Product Management
- Product catalog with SKU, pricing, unit of measure, and stock.
- Nested product categories.
- Product image upload endpoint.

#### Order Management
- Order creation with line items and automatic total computation (subtotal, tax, total).
- Order status workflow: Draft → Confirmed → Processing → Completed → Cancelled.
- Print-ready order view.

#### Invoice Management
- Invoice generation linked to orders.
- Automatic invoice numbering (`INV-YYYY-NNNNN`).
- Server-side **PDF generation** and download.
- Payment recording (full and partial) with status tracking (Unpaid/Partial/Paid/Overdue).

#### Inventory Management
- Stock entry (inbound) and stock exit (outbound) with reason codes.
- Automatic stock level updates.
- Full movement history with reference tracking.
- Low-stock notifications on the dashboard.

#### Finance
- Accounts payable view with aging buckets.
- Accounts receivable view with aging and payment recording.
- Cash flow statement (inflows vs. outflows).

#### Dashboard
- KPI tiles (customers, open orders, inventory value, receivables, cash).
- Charts: sales trend, top products, cash flow, orders by status.
- Real-time notifications (low stock, overdue invoices, failed logins).

#### Reports
- Sales, inventory, customer, product, and financial reports.
- Date-range filtering and CSV/Excel/PDF export.

#### Audit Logs
- Immutable recording of authentication and data-mutation events.
- Filterable audit log viewer for administrators.

#### Infrastructure & Tooling
- Clean Architecture backend (.NET 9): Core, Application, Infrastructure, Api.
- Angular 19 frontend with signals, lazy routes, and theming.
- SQL Server schema with 18 tables, migrations, and seed data.
- Swagger / OpenAPI 3 documentation.
- Dockerfile and docker-compose for API, web, and SQL Server.
- Unit and integration test scaffolding (xUnit, Karma/Jasmine).

---

[1.0.0]: https://github.com/enterprise/ems/releases/tag/v1.0.0
