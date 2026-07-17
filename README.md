# Enterprise Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/enterprise/ems)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green)](docs/CHANGELOG.md)
[![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-19-DE0031)](https://angular.dev/)

**Enterprise Management System (EMS)** is a full-stack business management platform that unifies customer, supplier, product, order, invoice, inventory, and financial operations under a single, role-based, secure application. It is built with a clean architecture backend (**.NET 9 Web API**) and a modern reactive frontend (**Angular 19**), backed by **Microsoft SQL Server**.

---

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots / Demo](#screenshots--demo)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Support / Contact](#support--contact)

---

## Project Description

The Enterprise Management System helps small and medium-sized businesses manage their entire operational lifecycle:

- Maintain **customers**, **suppliers**, and **contacts**.
- Catalogue **products** and **categories**.
- Process **sales orders** and track their lifecycle.
- Generate **invoices** with downloadable **PDF** output.
- Track **inventory** movements (stock entry/exit) with full history.
- Manage **finance**: accounts payable, accounts receivable, and cash flow.
- Produce **reports** across sales, inventory, customers, products, and finance.
- Enforce **role-based access control (RBAC)** with audit logging.

The system ships with a responsive dashboard, dark/light theming, and a fully documented REST API (Swagger UI included).

---

## Features

| Module | Capabilities |
| --- | --- |
| **Authentication & Authorization** | JWT + refresh tokens, secure password hashing, role & permission-based access, account lockout. |
| **Dashboard** | KPI tiles, charts (sales, inventory, cash flow), recent activity, notifications. |
| **User Management** | Create/edit/disable users, assign roles, reset passwords, profile management. |
| **Role & Permission Management** | Define roles, assign granular permissions, system & custom roles. |
| **Customer Management** | Customer records, multiple contacts, credit limits, balance tracking. |
| **Supplier Management** | Supplier records, contacts, payment terms. |
| **Product Management** | Products with pricing, units, categories, stock levels. |
| **Order Management** | Create orders, line items, status workflow, print/export. |
| **Invoice Management** | Generate invoices from orders, PDF generation, payment tracking. |
| **Inventory Management** | Stock entry/exit, adjustments, full movement history. |
| **Finance** | Accounts payable, accounts receivable, cash flow statements. |
| **Reports** | Sales, inventory, customer, product, and financial reports (filterable, exportable). |
| **Settings** | Company profile, preferences, theme (light/dark), localization. |
| **Audit Logs** | Immutable record of security- and data-relevant events. |

---

## Tech Stack

### Frontend
- **Angular 19** (standalone components, signals)
- **TypeScript 5**
- **RxJS** for reactive streams
- **Angular Material** / SCSS for UI
- **Chart.js** (or equivalent) for dashboard charts
- **JWT** auth interceptor

### Backend
- **.NET 9 SDK** (C# 13)
- **ASP.NET Core 9 Web API**
- **Entity Framework Core 9** (SQL Server provider)
- **MediatR** for CQRS-style request handling
- **FluentValidation** for input validation
- **AutoMapper** for DTO mapping
- **Serilog** for structured logging
- **JWT Bearer** authentication

### Database
- **Microsoft SQL Server 2019+** (Express, Developer, or Standard)
- **SQL Server LocalDB** for local development
- Migrations managed via EF Core

### DevOps / Tooling
- **Docker** & **Docker Compose**
- **Swagger / OpenAPI 3** for API docs
- **xUnit** + **Moq** for backend tests
- **Karma / Jasmine** for frontend tests

---

## Screenshots / Demo

> **Note:** The screenshots below are placeholders. Replace the paths with real captures when available.

| Screen | Description |
| --- | --- |
| `docs/assets/dashboard.png` | Main dashboard with KPI tiles and charts. |
| `docs/assets/orders.png` | Order management list and detail view. |
| `docs/assets/invoice.png` | Invoice preview with PDF export button. |
| `docs/assets/users.png` | User and role administration screen. |

**Live demo:** `https://demo.ems.example.com` (placeholder)

---

## Quick Start

Get a local instance running in under 10 minutes using Docker:

```bash
git clone https://github.com/enterprise/ems.git
cd ems
docker compose up --build
```

Then open:
- Frontend: http://localhost:4200
- API + Swagger: http://localhost:5000/swagger

Default admin credentials (development only):

```
Email:    admin@ems.local
Password: Admin@12345
```

---

## Installation

For detailed, step-by-step instructions covering Windows, Linux, and macOS, see **[docs/INSTALL.md](docs/INSTALL.md)**.

Summary:

1. Install **Node.js 20+**, **.NET 9 SDK**, and **SQL Server** (or Docker).
2. Clone the repository.
3. Configure the database connection string.
4. Apply database migrations / seed data.
5. Start the backend (`dotnet run`) and frontend (`ng serve`).

---

## Configuration

Configuration is environment-driven. The backend reads from `appsettings.json` and overrides via environment variables / `appsettings.{Environment}.json`.

Key settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_STRONG_SECRET",
    "Issuer": "EMS",
    "Audience": "EMS-Client",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  }
}
```

The frontend uses `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

See **[docs/INSTALL.md](docs/INSTALL.md)** → *Step 5: Environment configuration* for the full reference.

---

## Running the Application

**Backend** (from `/src/Backend`):

```bash
dotnet restore
dotnet run --project EMS.Api
```

**Frontend** (from `/src/Frontend`):

```bash
npm install
npm start
```

Visit http://localhost:4200.

---

## Building for Production

**Backend:**

```bash
dotnet publish src/Backend/EMS.Api/EMS.Api.csproj -c Release -o ./publish
```

**Frontend:**

```bash
npm run build -- --configuration production
```

The compiled frontend is emitted to `dist/`. Serve it with any static host or via the backend's static file middleware.

---

## Docker Setup

The repository includes `Dockerfile` and `docker-compose.yml` for the API, the Angular app (served via Nginx), and SQL Server.

```bash
# Build and start everything
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop
docker compose down
```

`docker-compose.yml` exposes:
- `sqlserver` on `1433`
- `api` on `5000`
- `web` (frontend) on `8080`

---

## API Documentation

The REST API is fully documented with OpenAPI 3 and served via Swagger UI.

- Swagger UI (local): http://localhost:5000/swagger
- Full written reference: **[docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)**

---

## Testing

**Backend:**

```bash
dotnet test
```

**Frontend:**

```bash
npm test
```

**End-to-end:**

```bash
npm run e2e
```

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feat/my-feature`).
2. Follow the existing code style and architecture (clean architecture layers).
3. Add/update unit tests for your changes.
4. Ensure `dotnet test` and `npm test` pass.
5. Run `dotnet format` and the ESLint/Prettier checks.
6. Open a pull request describing the change and referencing any issue.

Please read **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** before contributing so your code fits the established patterns.

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE).

---

## Support / Contact

- **Documentation:** see the [`docs/`](docs) folder.
- **Issues:** https://github.com/enterprise/ems/issues
- **Email:** support@ems.example.com
- **Community:** https://community.ems.example.com

---

### Documentation Index

| Document | Purpose |
| --- | --- |
| [README.md](README.md) | Project overview and quick start. |
| [docs/INSTALL.md](docs/INSTALL.md) | Detailed installation guide. |
| [docs/USER_MANUAL.md](docs/USER_MANUAL.md) | End-user operating manual. |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | REST API reference. |
| [docs/DATABASE.md](docs/DATABASE.md) | Database schema and maintenance. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System and software architecture. |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Version history. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Future plans and timeline. |
