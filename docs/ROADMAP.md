# Roadmap

This roadmap outlines the planned evolution of the **Enterprise Management System (EMS)**. Dates are indicative and may shift based on feedback and capacity. Each entry lists target features and any associated technical-debt items to address.

---

## Version Timeline Overview

| Version | Status | Theme | Target |
| --- | --- | --- | --- |
| 1.0.0 | ✅ Released | Initial Release | 2026-07-17 |
| 1.1.0 | 📋 Planned | Enhanced Reporting | 2026-Q4 |
| 1.2.0 | 📋 Planned | Multi-company Support | 2027-Q1 |
| 1.3.0 | 📋 Planned | Advanced Analytics | 2027-Q2 |
| 2.0.0 | 📋 Planned | Mobile App | 2027-Q3 |
| 2.1.0 | 📋 Planned | AI-powered Insights | 2027-Q4 |
| 2.2.0 | 📋 Planned | Integration Marketplace | 2028-Q1 |
| 3.0.0 | 🔮 Future | Microservices Migration | 2028+ |

Legend: ✅ Released · 📋 Planned · 🔮 Future

---

## 1.0.0 — Current: Initial Release
**Status:** Released 2026-07-17

Full feature set: authentication, RBAC, customers, suppliers, products, orders, invoices (PDF), inventory, finance, dashboard, reports, audit logs. See [CHANGELOG.md](CHANGELOG.md).

---

## 1.1.0 — Planned: Enhanced Reporting
**Target:** 2026-Q4

### Features
- Scheduled report delivery (email on a cron).
- Custom report builder (drag-and-drop columns, filters, saved views).
- Pivot/summary tables and bar/line/pie exports.
- CSV/Excel bulk import for customers, products, and suppliers.
- Localization of report labels.

### Technical Debt
- Replace ad-hoc report queries with a shared reporting repository.
- Add integration tests for each report type.

---

## 1.2.0 — Planned: Multi-company Support
**Target:** 2027-Q1

### Features
- Tenant/company scoping on all business data.
- Company switcher in the UI with per-company settings and branding.
- Cross-company consolidated reports (admin only).
- Per-company user assignments and roles.

### Technical Debt
- Introduce a `CompanyId` discriminator across the 18 tables (migration strategy).
- Enforce tenant isolation at the repository/query-filter layer.
- Audit log must capture company context.

---

## 1.3.0 — Planned: Advanced Analytics
**Target:** 2027-Q2

### Features
- Cohort and retention analysis for customers.
- Inventory turnover and dead-stock detection.
- Margin and profitability analytics by product/category.
- Forecasted cash flow based on receivables/payables aging.
- Configurable dashboard widgets (user-customizable layouts).

### Technical Debt
- Introduce a read-optimized reporting database / materialized views.
- Migrate dashboard aggregates to the caching layer (Redis).

---

## 2.0.0 — Planned: Mobile App
**Target:** 2027-Q3

### Features
- Native/hybrid mobile app (iOS & Android) for field staff.
- Barcode/QR scanning for inventory and products.
- Offline-first order entry with sync on reconnect.
- Push notifications for low stock and overdue invoices.

### Technical Debt
- Extract shared API client into an SDK consumable by web + mobile.
- Harden API for intermittent connectivity (idempotent writes, sync tokens).

---

## 2.1.0 — Planned: AI-powered Insights
**Target:** 2027-Q4

### Features
- Demand forecasting for products using historical sales.
- Anomaly detection on transactions and inventory.
- Natural-language query ("show me top customers this quarter").
- Smart payment reminders and dunning suggestions.

### Technical Debt
- Define an ML feature store fed from the reporting DB.
- Establish model governance, evaluation, and rollback procedures.

---

## 2.2.0 — Planned: Integration Marketplace
**Target:** 2028-Q1

### Features
- Plugin/connector framework (webhooks + REST adapters).
- Prebuilt connectors: payment gateways, accounting (e.g., QuickBooks), shipping, e-commerce.
- OAuth app registration for third-party developers.
- Event bus for outbound domain events.

### Technical Debt
- Formalize the outbound event schema and versioning.
- Build a connector sandbox and review process.

---

## 3.0.0 — Future: Microservices Migration
**Target:** 2028 and beyond

### Features
- Decompose the monolith into domain services (Identity, Catalog, Orders, Billing, Inventory, Finance, Reporting).
- API gateway with unified auth and routing.
- Event-driven communication (message broker).
- Independent deployability and scaling per service.

### Technical Debt
- Eliminate shared database coupling (per-service databases).
- Implement distributed tracing and saga-based consistency.
- Migrate from in-process MediatR to cross-service messaging.

---

## How to Influence the Roadmap

- Open a feature request: https://github.com/enterprise/ems/issues
- Join the community: https://community.ems.example.com
- Priorities are reviewed each quarter based on user feedback and adoption metrics.
