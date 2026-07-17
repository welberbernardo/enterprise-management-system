# API Documentation

This document describes the **Enterprise Management System (EMS)** REST API. The API is implemented with ASP.NET Core 9 and documented live via Swagger UI (OpenAPI 3).

---

## Table of Contents

- [Introduction](#introduction)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Common Response Formats](#common-response-formats)
- [Pagination, Filtering & Sorting](#pagination-filtering--sorting)
- [Rate Limiting](#rate-limiting)
- [File Uploads](#file-uploads)
- [Swagger UI](#swagger-ui)
- [Module: Auth](#module-auth)
- [Module: Users](#module-users)
- [Module: Roles](#module-roles)
- [Module: Customers](#module-customers)
- [Module: Suppliers](#module-suppliers)
- [Module: Products](#module-products)
- [Module: Orders](#module-orders)
- [Module: Invoices](#module-invoices)
- [Module: Inventory](#module-inventory)
- [Module: Finance](#module-finance)
- [Module: Reports](#module-reports)
- [Module: Audit Logs](#module-audit-logs)

---

## Introduction

The EMS API follows REST conventions. It uses JSON for request and response bodies, returns appropriate HTTP status codes, and requires a **Bearer JWT** for all endpoints except authentication.

---

## Base URL

```
http://localhost:5000/api
```

In production, replace with your hosted API base, e.g. `https://api.ems.example.com/api`.

All endpoints below are relative to this base URL and are **versioned** under `/v1`.

---

## Authentication

EMS uses **JWT Bearer** tokens plus **refresh tokens**.

### Login

`POST /v1/auth/login`

**Request body:**

```json
{
  "email": "admin@ems.local",
  "password": "Admin@12345"
}
```

**Response `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4-...",
  "expiresAt": "2026-07-17T19:35:42Z",
  "user": {
    "id": "3f2a...",
    "email": "admin@ems.local",
    "fullName": "System Admin",
    "roles": ["Admin"]
  }
}
```

### Using the token

Include it in the `Authorization` header of every request:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refreshing the token

`POST /v1/auth/refresh`

```json
{
  "token": "<expired-or-valid-access-token>",
  "refreshToken": "<refreshToken>"
}
```

Returns a new `token` and `refreshToken`. Refresh tokens are single-use and rotated on each refresh.

### Logout

`POST /v1/auth/logout` — revokes the current refresh token.

---

## Error Handling

Errors return a consistent JSON envelope and an appropriate HTTP status code.

**Example `400`:**

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["The Email field is required."],
    "password": ["Password must be at least 12 characters."]
  },
  "traceId": "00-abc123-..."
}
```

**Example `401`:**

```json
{
  "success": false,
  "message": "Unauthorized. Invalid or missing token."
}
```

**Example `404`:**

```json
{
  "success": false,
  "message": "Customer 'a1b2' was not found."
}
```

**Example `500`:**

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "traceId": "00-def456-..."
}
```

### Status code summary

| Code | Meaning |
| --- | --- |
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permission) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Common Response Formats

A successful collection response is wrapped with pagination metadata:

```json
{
  "items": [ { "id": "1", "name": "Acme" } ],
  "page": 1,
  "pageSize": 20,
  "totalItems": 145,
  "totalPages": 8
}
```

A single resource response returns the object directly (with `success` envelope in mutation responses):

```json
{
  "success": true,
  "data": { "id": "1", "name": "Acme" }
}
```

---

## Pagination, Filtering & Sorting

List endpoints accept:

| Query param | Type | Description |
| --- | --- | --- |
| `page` | int | 1-based page number (default 1). |
| `pageSize` | int | Items per page (default 20, max 100). |
| `sortBy` | string | Column to sort by. |
| `sortDir` | string | `asc` or `desc` (default `asc`). |
| `search` | string | Free-text filter. |
| `from` / `to` | date | Date-range filters where applicable. |

Example:

```
GET /v1/orders?page=2&pageSize=25&sortBy=orderDate&sortDir=desc&search=acme
```

---

## Rate Limiting

- Default limit: **100 requests / 60 seconds** per IP for anonymous endpoints.
- Authenticated limit: **600 requests / 60 seconds** per user.
- Exceeding the limit returns `429 Too Many Requests` with `Retry-After` header (seconds).
- Auth endpoints (`/login`, `/refresh`) have stricter limits to mitigate brute force.

---

## File Uploads

File uploads use `multipart/form-data`. The maximum request size is **10 MB** by default.

Example — uploading a product image:

```
POST /v1/products/{id}/image
Content-Type: multipart/form-data

file: <binary>
```

Response `200`:

```json
{ "success": true, "url": "https://api.ems.example.com/uploads/products/1.png" }
```

---

## Swagger UI

Interactive documentation is served at:

```
http://localhost:5000/swagger
```

It includes request schemas, example values, and the ability to authorize with a JWT and try calls directly.

---

## Module: Auth

| Method | URL | Description |
| --- | --- | --- |
| POST | `/v1/auth/login` | Authenticate and receive tokens. |
| POST | `/v1/auth/refresh` | Rotate access + refresh token. |
| POST | `/v1/auth/logout` | Revoke refresh token. |
| POST | `/v1/auth/forgot-password` | Request password reset email. |
| POST | `/v1/auth/reset-password` | Set new password via token. |
| POST | `/v1/auth/change-password` | Change password (authenticated). |

**Forgot password request:**

```json
{ "email": "user@ems.local" }
```

**Reset password request:**

```json
{ "token": "reset-token", "newPassword": "NewStrong@123" }
```

---

## Module: Users

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/users` | List users (paginated). |
| GET | `/v1/users/{id}` | Get a user. |
| POST | `/v1/users` | Create a user. |
| PUT | `/v1/users/{id}` | Update a user. |
| DELETE | `/v1/users/{id}` | Disable/delete a user. |

**Create user request:**

```json
{
  "fullName": "Jane Doe",
  "email": "jane@ems.local",
  "phone": "+1 555 0100",
  "roleIds": ["role-admin"],
  "isActive": true
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": { "id": "usr-9", "email": "jane@ems.local", "isActive": true }
}
```

---

## Module: Roles

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/roles` | List roles. |
| GET | `/v1/roles/{id}` | Get role with permissions. |
| POST | `/v1/roles` | Create role. |
| PUT | `/v1/roles/{id}` | Update role/permissions. |
| DELETE | `/v1/roles/{id}` | Delete role. |

**Create role request:**

```json
{
  "name": "Warehouse",
  "description": "Inventory operations only",
  "permissions": ["Inventory.View", "Inventory.Entry", "Inventory.Exit"]
}
```

---

## Module: Customers

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/customers` | List customers. |
| GET | `/v1/customers/{id}` | Get customer (+ contacts). |
| POST | `/v1/customers` | Create customer. |
| PUT | `/v1/customers/{id}` | Update customer. |
| DELETE | `/v1/customers/{id}` | Delete customer. |
| GET | `/v1/customers/{id}/contacts` | List contacts. |
| POST | `/v1/customers/{id}/contacts` | Add contact. |

**Create customer request:**

```json
{
  "name": "Acme Corporation",
  "taxId": "US-12345678",
  "email": "billing@acme.com",
  "phone": "+1 555 0200",
  "address": "1 Main St, Springfield",
  "creditLimit": 50000,
  "paymentTermsDays": 30
}
```

---

## Module: Suppliers

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/suppliers` | List suppliers. |
| GET | `/v1/suppliers/{id}` | Get supplier. |
| POST | `/v1/suppliers` | Create supplier. |
| PUT | `/v1/suppliers/{id}` | Update supplier. |
| DELETE | `/v1/suppliers/{id}` | Delete supplier. |

**Create supplier request:**

```json
{
  "name": "Global Components Ltd",
  "taxId": "GB-99887766",
  "email": "sales@globalcomp.com",
  "phone": "+44 20 7946 0000",
  "address": "10 Trade Rd, London",
  "paymentTermsDays": 45
}
```

---

## Module: Products

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/products` | List products (filter by category). |
| GET | `/v1/products/{id}` | Get product. |
| POST | `/v1/products` | Create product. |
| PUT | `/v1/products/{id}` | Update product. |
| DELETE | `/v1/products/{id}` | Delete product. |
| GET | `/v1/categories` | List categories. |
| POST | `/v1/categories` | Create category. |
| POST | `/v1/products/{id}/image` | Upload product image. |

**Create product request:**

```json
{
  "sku": "WID-001",
  "name": "Industrial Widget",
  "description": "Standard grade widget",
  "categoryId": "cat-3",
  "unitOfMeasure": "each",
  "purchasePrice": 12.50,
  "salePrice": 19.99,
  "reorderLevel": 50,
  "stock": 120
}
```

---

## Module: Orders

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/orders` | List orders. |
| GET | `/v1/orders/{id}` | Get order with line items. |
| POST | `/v1/orders` | Create order (draft). |
| PUT | `/v1/orders/{id}` | Update order. |
| POST | `/v1/orders/{id}/confirm` | Confirm (reserve stock). |
| POST | `/v1/orders/{id}/cancel` | Cancel order. |
| GET | `/v1/orders/{id}/print` | Get print-ready HTML. |

**Create order request:**

```json
{
  "customerId": "cust-7",
  "orderDate": "2026-07-17",
  "items": [
    { "productId": "prod-1", "quantity": 10, "unitPrice": 19.99 }
  ],
  "taxRate": 0.10,
  "notes": "Priority shipping"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "ord-1024",
    "orderNumber": "ORD-2026-001024",
    "status": "Draft",
    "total": 219.89
  }
}
```

---

## Module: Invoices

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/invoices` | List invoices. |
| GET | `/v1/invoices/{id}` | Get invoice. |
| POST | `/v1/invoices` | Create/issue invoice. |
| POST | `/v1/invoices/{id}/payments` | Record payment. |
| GET | `/v1/invoices/{id}/pdf` | Download PDF (binary). |

**Create invoice request:**

```json
{
  "orderId": "ord-1024",
  "issueDate": "2026-07-17",
  "dueDate": "2026-08-16",
  "notes": "Thank you for your business"
}
```

**Record payment request:**

```json
{
  "amount": 219.89,
  "method": "Transfer",
  "paymentDate": "2026-07-20"
}
```

---

## Module: Inventory

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/inventory/movements` | List movements (paginated). |
| POST | `/v1/inventory/entry` | Stock entry (inbound). |
| POST | `/v1/inventory/exit` | Stock exit (outbound). |
| GET | `/v1/inventory/stock-levels` | Current stock per product. |

**Stock entry request:**

```json
{
  "supplierId": "sup-2",
  "reference": "PO-5001",
  "items": [
    { "productId": "prod-1", "quantity": 100 }
  ]
}
```

**Stock exit request:**

```json
{
  "reason": "Sale",
  "reference": "ORD-2026-001024",
  "items": [
    { "productId": "prod-1", "quantity": 10 }
  ]
}
```

---

## Module: Finance

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/finance/accounts-payable` | List payable bills. |
| GET | `/v1/finance/accounts-receivable` | List receivables. |
| GET | `/v1/finance/cash-flow?from=&to=` | Cash flow statement. |

All return paginated/aggregated JSON suitable for charts.

---

## Module: Reports

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/reports/sales` | Sales report. |
| GET | `/v1/reports/inventory` | Inventory report. |
| GET | `/v1/reports/customers` | Customer report. |
| GET | `/v1/reports/products` | Product report. |
| GET | `/v1/reports/financial` | Financial summary. |
| GET | `/v1/reports/{type}/export?format=pdf|excel|csv` | Export report. |

Example:

```
GET /v1/reports/sales?from=2026-01-01&to=2026-07-17&groupBy=customer
```

---

## Module: Audit Logs

| Method | URL | Description |
| --- | --- | --- |
| GET | `/v1/audit-logs` | List audit events (paginated, filterable). |
| GET | `/v1/audit-logs/{id}` | Get a single event. |

Query params: `action`, `entity`, `userId`, `from`, `to`.

**Sample entry:**

```json
{
  "id": "log-5521",
  "timestamp": "2026-07-17T18:40:12Z",
  "userId": "usr-9",
  "action": "Update",
  "entity": "Product",
  "entityId": "prod-1",
  "ipAddress": "192.0.2.45",
  "detail": "Changed salePrice 19.99 -> 21.50"
}
```
