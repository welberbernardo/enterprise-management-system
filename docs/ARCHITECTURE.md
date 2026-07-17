# Architecture Documentation

This document explains the **Enterprise Management System (EMS)** architecture: how the system is structured, how the layers interact, and the key technical decisions behind them.

---

## Table of Contents

- [System Architecture Overview](#system-architecture-overview)
- [Clean Architecture Layers](#clean-architecture-layers)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Architecture](#database-architecture)
- [Authentication / Authorization Flow](#authentication--authorization-flow)
- [Data Flow](#data-flow)
- [API Versioning Strategy](#api-versioning-strategy)
- [Error Handling Strategy](#error-handling-strategy)
- [Logging Strategy](#logging-strategy)
- [Caching Strategy](#caching-strategy)
- [Security Considerations](#security-considerations)
- [Scalability Considerations](#scalability-considerations)
- [Technology Decisions](#technology-decisions)

---

## System Architecture Overview

EMS is a **client-server** system with a clear separation between the presentation tier (Angular SPA) and the API tier (.NET Web API), both backed by a single SQL Server database.

```
┌────────────────────┐        HTTPS / JSON         ┌──────────────────────┐
│  Angular 19 SPA    │ ─────────────────────────▶ │   ASP.NET Core 9     │
│  (Browser)         │ ◀───────────────────────── │   Web API            │
│  - UI Components   │      JWT Bearer             │   - Controllers      │
│  - State (signals)│                             │   - MediatR handlers  │
│  - HTTP client     │                             │   - Domain services  │
└────────────────────┘                             └──────────┬───────────┘
                                                              │ EF Core 9
                                                              ▼
                                                    ┌────────────────────┐
                                                    │  SQL Server (EMS)  │
                                                    │  - 18 tables       │
                                                    │  - Migrations      │
                                                    └────────────────────┘
```

---

## Clean Architecture Layers

The backend follows **Clean Architecture** (Dependency Rule: dependencies point inward).

```
EMS.Api (Presentation)
   │ depends on
EMS.Application (Use cases, DTOs, interfaces, CQRS)
   │ depends on
EMS.Domain / Core (Entities, value objects, domain rules)
   ▲ depends on
EMS.Infrastructure (EF Core, repositories, external services)
```

| Layer | Responsibility | Key types |
| --- | --- | --- |
| **Core / Domain** | Business entities and rules; no external dependencies. | `User`, `Order`, `Product`, `Invoice`, domain services. |
| **Application** | Use cases, command/query handlers, DTOs, interfaces (abstractions). | `CreateOrderCommand`, `GetOrdersQuery`, `IRepository<T>`. |
| **Infrastructure** | Concrete implementations: EF Core `DbContext`, repositories, email, file storage. | `AppDbContext`, `EfRepository<T>`, `SmtpEmailService`. |
| **Presentation (Api)** | HTTP concerns: controllers, middleware, JWT, validation, Swagger. | `OrdersController`, `Program.cs`, filters. |

This keeps business logic testable without a database or web framework.

---

## Frontend Architecture

- **Framework:** Angular 19 with standalone components (no `NgModule` boilerplate).
- **State:** Angular **signals** for local/component state and a lightweight `AuthStore` for session state.
- **Structure:**
  ```
  src/app/
    core/         # http, auth guard, interceptors, models
    features/     # customers/, orders/, invoices/ ... (one module per domain)
    shared/       # reusable UI (tables, dialogs, forms)
    layout/       # shell, sidebar, navbar
  ```
- **HTTP:** A typed `ApiService` wraps `HttpClient`; a JWT **interceptor** attaches the bearer token and a **refresh interceptor** retries on 401.
- **Routing:** Lazy-loaded feature modules with route-level `canActivate` guards checking permissions.
- **UI:** Angular Material components + SCSS theming (light/dark via CSS variables).

---

## Backend Architecture

- **Host:** ASP.NET Core 9 minimal-hosting model (`WebApplication`).
- **Pattern:** **CQRS-lite** via **MediatR** — controllers send commands/queries; handlers contain use-case logic.
- **Validation:** **FluentValidation** pipelines validate incoming commands before handlers run.
- **Mapping:** **AutoMapper** profiles map entities ↔ DTOs.
- **Persistence:** **EF Core 9** with a unit-of-work `DbContext`; repositories abstract data access.
- **DI:** All services registered in `Program.cs`; interfaces resolved from Infrastructure.
- **Cross-cutting:** Middleware handles exception translation, correlation IDs, and request logging.

---

## Database Architecture

- **Provider:** SQL Server via EF Core `UseSqlServer`.
- **Migrations:** Code First; `EMS.Infrastructure` owns the migration assemblies.
- **Unit of Work:** `SaveChangesAsync` commits a transaction per request.
- **Concurrency:** Row-version (`byte[] Version`) optimistic concurrency on key entities.
- **Soft delete:** global EF query filter on `IsDeleted` for business entities.
- **Audit:** application-level writes to `AuditLogs` (not SQL triggers) for portability.

---

## Authentication / Authorization Flow

1. Client `POST /v1/auth/login` with email/password.
2. API verifies password hash, then issues a **short-lived JWT** (access token, 60 min) and a **refresh token** (7 days, stored hashed in `User`/token store).
3. Client stores tokens (preferably in memory + secure cookie for refresh).
4. Every API call sends `Authorization: Bearer <jwt>`.
5. On `401`, the refresh interceptor calls `/v1/auth/refresh` to obtain a new pair (refresh token is rotated).
6. **Authorization** uses ASP.NET Core policies: claims carry `role` and `permission`; handlers check `PermissionRequirement` (e.g., `Orders.Create`).

```
Login ─▶ validate ─▶ issue JWT + refresh
   │
Request ─▶ [Auth Middleware] ─▶ validate JWT signature/exp
   │
   └▶ [Authorization Policy] ─▶ check permission claim ─▶ handler or 403
```

---

## Data Flow

**Create Order example:**

```
UI (form) ─▶ ApiService.post('/orders', dto)
   │
   ▼
OrdersController.CreateOrder(CreateOrderCommand)
   │ MediatR
   ▼
CreateOrderCommandHandler
   ├─ FluentValidation (passed)
   ├─ Load Customer + Products (repositories)
   ├─ Domain: build Order + OrderItems, compute totals
   ├─ Persist via DbContext (transaction)
   ├─ Write AuditLogs entry
   └─ Return OrderDto
   │
   ▼
Controller → 201 Created (OrderDto)
   │
   ▼
UI → navigate to order detail, show toast
```

---

## API Versioning Strategy

- URL-based versioning: `/api/v1/...`, `/api/v2/...`.
- New backwards-incompatible changes go to a new `v{N+1}` route group; old versions are supported for at least one major release.
- OpenAPI documents are generated per version; Swagger UI lists them.
- Deprecations are announced in the CHANGELOG and via an `Api-Deprecated` response header.

---

## Error Handling Strategy

- Exceptions are caught by a central **exception middleware** that maps them to consistent JSON envelopes (see API docs).
- Domain rule violations throw typed exceptions (`ValidationException`, `NotFoundException`, `ConflictException`) mapped to `400/404/409`.
- Unhandled exceptions return `500` with a `traceId` (correlation ID) for support lookup; details are not leaked to clients.
- Validation errors aggregate field-level messages.

---

## Logging Strategy

- **Serilog** with structured logging; sinks: console (dev) and file/Seq (prod).
- Every request logs method, path, status, duration, and correlation ID.
- Sensitive data (passwords, tokens) is never logged.
- Log levels: `Information` default; `Warning` for auth failures; `Error` for unhandled exceptions.
- Correlation ID flows from request header through all layers and into the log context.

---

## Caching Strategy

- **Dashboard aggregates** cached in-memory (IMemoryCache) with a 5-minute sliding window; invalidated on relevant writes.
- **Static reference data** (categories, permissions) cached for the session.
- **HTTP caching:** `Cache-Control` on GET list endpoints where data is non-sensitive.
- No distributed cache required for single-node; Redis is the recommended add-on when scaling out (see Scalability).

---

## Security Considerations

- **Transport:** HTTPS only; HSTS enabled in production.
- **Auth:** JWT with short lifetime; refresh token rotation and revocation list.
- **Passwords:** strong hashing (Argon2id / BCrypt), enforced password policy, account lockout after N failed attempts.
- **Authorization:** permission-based policies, least privilege by default.
- **CORS:** strictly allow-listed origins (no wildcards in production).
- **Input:** model validation + parameterized queries (EF Core) prevent injection.
- **Secrets:** `Jwt:Key` and connection strings via user-secrets/env vars, never committed.
- **Audit:** immutable logs of auth and data mutations for forensics.
- **File uploads:** size limits (10 MB), type allow-list, stored outside web root.

---

## Scalability Considerations

- **Stateless API:** no server-side session state → horizontal scaling behind a load balancer.
- **Database:** read replicas can serve reporting; connection pooling via EF Core.
- **Caching:** add Redis for shared cache across API nodes.
- **Background jobs:** long-running tasks (report generation, email, balance reconciliation) moved to a hosted service / queue (e.g., Hangfire, Azure Queue).
- **Frontend:** static build served via CDN/Nginx; cache-busting hashes.
- **Bottlenecks:** inventory balance recomputation is the main write contention; mitigated by denormalized columns + nightly reconciliation.

---

## Technology Decisions

| Decision | Rationale |
| --- | --- |
| **.NET 9 / ASP.NET Core** | High performance, mature ecosystem, first-class EF Core and JWT support. |
| **Angular 19** | Strong typing, signals, enterprise-grade tooling, excellent material UI. |
| **Clean Architecture** | Testability, framework independence, clear boundaries. |
| **MediatR + CQRS-lite** | Decouples controllers from use cases; pipeline behaviors for validation/logging. |
| **EF Core 9** | Productive ORM with migrations, SQL Server support, change tracking. |
| **SQL Server** | Reliable RDBMS with strong tooling; LocalDB simplifies dev. |
| **JWT + refresh** | Stateless auth suitable for SPA + scaling; refresh rotation limits risk. |
| **Serilog** | Structured logs queryable by correlation ID; easy sink swapping. |
| **FluentValidation** | Declarative, testable validation separate from handlers. |
| **Docker** | Reproducible environments across dev/CI/prod. |
