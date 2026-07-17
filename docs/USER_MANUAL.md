# User Manual

This manual explains how to use the **Enterprise Management System (EMS)** from a day-to-day operator perspective. It assumes the system has already been installed (see [INSTALL.md](../docs/INSTALL.md)) and that you have a user account.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard](#3-dashboard)
4. [User Management](#4-user-management)
5. [Customer Management](#5-customer-management)
6. [Supplier Management](#6-supplier-management)
7. [Product Management](#7-product-management)
8. [Order Management](#8-order-management)
9. [Invoice Management](#9-invoice-management)
10. [Inventory Management](#10-inventory-management)
11. [Finance](#11-finance)
12. [Reports](#12-reports)
13. [Settings](#13-settings)
14. [Audit Logs](#14-audit-logs)
15. [Best Practices](#15-best-practices)
16. [FAQ](#16-faq)

---

## 1. Introduction

EMS centralizes your business operations. Depending on your assigned **role**, you will see a subset of the modules described below. Administrators see everything; cashiers may only see orders and invoices; warehouse staff may only see inventory.

> **Screenshot placeholder:** `docs/assets/login.png` — the login screen with email/password and "Forgot password?" link.

---

## 2. Getting Started

### Login

1. Open the application URL (e.g., `http://localhost:4200`).
2. Enter your **email** and **password**.
3. Click **Sign in**.

On success you are redirected to the **Dashboard**.

### First Login

The default administrator account is created during seeding:

```
Email:    admin@ems.local
Password: Admin@12345
```

> Change this password immediately after first login (see below).

### Changing Your Password

1. Click your avatar (top-right) → **Profile**.
2. Select the **Security** tab.
3. Enter the **current password**, a **new password**, and confirm it.
4. Click **Save**.

Password policy: minimum 12 characters, at least one uppercase, one lowercase, one digit, and one special character.

> **Screenshot placeholder:** `docs/assets/profile-security.png` — the profile/security tab with password fields.

---

## 3. Dashboard

The dashboard is your landing page and shows a real-time overview of the business.

### Overview

- **KPI tiles:** Total customers, open orders, inventory value, outstanding receivables, cash on hand.
- **Quick actions:** Create order, add customer, record stock entry.

### Statistics

Tiles update live from cached aggregates. Hovering a tile shows the period-over-period delta.

### Charts

- **Sales trend** (line chart, last 30 days).
- **Top products** (bar chart).
- **Cash flow** (area chart, inflow vs. outflow).
- **Orders by status** (donut chart).

### Notifications

A bell icon shows alerts: low-stock warnings, overdue invoices, failed login attempts. Click to expand and mark as read.

> **Screenshot placeholder:** `docs/assets/dashboard.png` — dashboard with KPI tiles, charts, and notification bell.

---

## 4. User Management

*Requires the `UserManagement` permission.*

### Users

1. Go to **Administration → Users**.
2. Click **New User**.
3. Fill in: name, email, phone, assigned role, status (active/disabled).
4. Click **Save**. A temporary password is emailed (or shown once).
5. To disable a user, open the row menu → **Disable**.

### Roles

1. Go to **Administration → Roles**.
2. Click **New Role**, provide a name and description.
3. Toggle the **permissions** the role should grant.
4. Click **Save**.

### Permissions

Permissions are granular flags (e.g., `Orders.Create`, `Invoices.View`). They are grouped by module and assigned to roles. A user's effective permissions are the union of all roles assigned to them.

> **Screenshot placeholder:** `docs/assets/users.png` — user list with role assignment dropdown.

---

## 5. Customer Management

### Customers

1. Go to **Customers → All Customers**.
2. Click **New Customer**.
3. Enter company name, tax ID, billing/shipping address, credit limit, and payment terms.
4. Click **Save**.

Each customer shows a **balance** (sum of unpaid invoices) and **lifetime value**.

### Contacts

Open a customer, switch to the **Contacts** tab, and add one or more contacts (name, email, phone, role). Mark one as primary.

> **Screenshot placeholder:** `docs/assets/customers.png` — customer detail with contacts tab.

---

## 6. Supplier Management

1. Go to **Suppliers → All Suppliers**.
2. Click **New Supplier** and enter the supplier's legal name, tax ID, address, and payment terms.
3. Add contacts in the **Contacts** tab.
4. Save.

Suppliers are referenced when recording **stock entries** (purchase receipts).

---

## 7. Product Management

### Categories

1. Go to **Products → Categories**.
2. Click **New Category**, enter a name and optional parent category.
3. Save. Categories can be nested.

### Products

1. Go to **Products → All Products**.
2. Click **New Product**.
3. Fill in: SKU, name, description, category, unit of measure, purchase price, sale price, reorder level, and current stock.
4. Save.

The product list supports search, filtering by category, and CSV export.

> **Screenshot placeholder:** `docs/assets/products.png` — product grid with filters and stock badges.

---

## 8. Order Management

### Creating an Order

1. Go to **Orders → New Order**.
2. Select a **customer**.
3. Add **line items**: search a product, set quantity and unit price (auto-filled from product).
4. The order total updates automatically, including any applicable tax.
5. Click **Save** (draft) or **Save & Confirm**.

### Order Statuses

| Status | Meaning |
| --- | --- |
| **Draft** | Created, not yet confirmed. Editable. |
| **Confirmed** | Accepted; inventory is reserved. |
| **Processing** | Being fulfilled. |
| **Completed** | Delivered/closed. |
| **Cancelled** | Voided. No financial impact. |

### Printing

Open an order and click **Print** to open a print-ready view. Use the browser's print dialog to save as PDF or send to a printer.

> **Screenshot placeholder:** `docs/assets/orders.png` — order detail with line items and status badge.

---

## 9. Invoice Management

### Creating an Invoice

1. Go to **Invoices → New Invoice**.
2. Link it to an existing **order** (recommended) or create standalone.
3. Verify line items, due date, and tax.
4. Click **Issue**. The invoice number is assigned automatically (format `INV-YYYY-00001`).

### PDF Generation

Open the issued invoice and click **Download PDF**. EMS renders a professional invoice (company header, line items, totals, notes) using the server-side PDF generator.

### Recording Payments

Open the invoice → **Record Payment**, enter amount, method (cash/transfer/card), and date. Partially paid invoices show a remaining balance.

> **Screenshot placeholder:** `docs/assets/invoice.png` — invoice preview with Download PDF and Record Payment buttons.

---

## 10. Inventory Management

### Stock Entry (inbound)

1. Go to **Inventory → Stock Entry**.
2. Select a **supplier** and optionally a linked purchase order.
3. Add products and received quantities.
4. Submit. Stock levels increase and a movement record is created.

### Stock Exit (outbound)

1. Go to **Inventory → Stock Exit**.
2. Select a reason (sale, adjustment, transfer, damage).
3. Add products and quantities.
4. Submit. Stock decreases.

### History

**Inventory → History** shows every movement with: date, product, type (entry/exit), quantity, reference (order/invoice), and user. Exportable to CSV.

> Low-stock products (below reorder level) trigger dashboard notifications.

---

## 11. Finance

### Accounts Payable

Lists supplier invoices/bills not yet paid, with due dates and aging buckets (0–30, 31–60, 61–90+ days).

### Accounts Receivable

Lists customer invoices with status (unpaid, partially paid, overdue) and aging. Click an invoice to record a payment.

### Cash Flow

**Finance → Cash Flow** shows inflows (receipts) and outflows (payments) over a selectable period, with a running balance and net position.

---

## 12. Reports

All reports are under **Reports** and support date-range filters and export (PDF/Excel/CSV).

| Report | Description |
| --- | --- |
| **Sales Report** | Revenue by period, by customer, by product. |
| **Inventory Report** | Stock levels, valuation, slow-moving items. |
| **Customer Report** | Top customers by revenue, balances. |
| **Product Report** | Best sellers, margin analysis. |
| **Financial Report** | Profit & loss summary, cash position. |

> **Screenshot placeholder:** `docs/assets/reports.png` — report builder with filters and export menu.

---

## 13. Settings

### Company Info

**Settings → Company** stores your legal name, tax ID, address, logo, and bank details. This information appears on generated invoices and reports.

### Preferences

Configure default tax rate, currency, date format, and number format.

### Theme

Toggle **Light / Dark** mode from the user menu or **Settings → Appearance**. The choice is saved per user.

---

## 14. Audit Logs

*Requires the `Audit.View` permission.*

**Administration → Audit Logs** records security- and data-relevant events: logins (success/failure), permission changes, record creation/updates/deletes, and configuration changes. Each entry shows timestamp, user, action, entity, and IP address. Use the filters to investigate incidents.

---

## 15. Best Practices

- **Change the default admin password** before going live.
- **Assign least-privilege roles** — don't make everyone an admin.
- **Record stock movements promptly** to keep inventory accurate.
- **Issue invoices from orders** to avoid mismatched data.
- **Reconcile Accounts Receivable/Payable** weekly.
- **Review Audit Logs** periodically for suspicious activity.
- **Back up the database** daily (see [DATABASE.md](../docs/DATABASE.md)).

---

## 16. FAQ

**Q: I forgot my password.**  
A: Click **Forgot password?** on the login screen and follow the reset email. Admins can also reset it from User Management.

**Q: Why can't I see a module?**  
A: Your role lacks the required permission. Contact an administrator.

**Q: How do I print an invoice as PDF?**  
A: Open the invoice and click **Download PDF**.

**Q: Stock shows negative — what happened?**  
A: A stock exit exceeded on-hand quantity. Review **Inventory → History** to find the movement and correct it with an adjustment.

**Q: Can I export data?**  
A: Yes. Lists and reports support CSV/Excel/PDF export.

**Q: The dashboard charts are empty.**  
A: There may be no data for the selected period, or the aggregate cache hasn't refreshed. Try changing the date range or reloading.
