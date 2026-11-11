# Enterprise Management System (EMS)

A full-stack enterprise management application built with **ASP.NET Core 9**, **React 18**, **TypeScript**, **Vite**, and **SQL Server**.

> **Portfolio status:** This repository is undergoing documentation, security and build verification. Features described below are represented in the codebase, but not all workflows have been end-to-end tested. Do not deploy to production without a security review.

## Architecture

- `backend/src/EnterpriseManagement.API` — ASP.NET Core Web API, controllers and authentication pipeline
- `backend/src/EnterpriseManagement.Application` — application services, mappings and validation
- `backend/src/EnterpriseManagement.Core` — entities, DTOs and interfaces
- `backend/src/EnterpriseManagement.Infrastructure` — EF Core, repositories, migrations and infrastructure services
- `backend/test` — unit and integration test projects
- `frontend` — React 18, TypeScript, Vite, Tailwind CSS and React Router
- `database` — SQL scripts
- `deployment` — container and deployment configuration (not yet verified end-to-end)
- `docs` — supplementary documentation; some pages may require updates

## Modules represented in the source tree

Authentication and permissions, users and roles, customers, suppliers, products, orders, invoices, inventory, financial accounts, reporting and audit logs.

## Prerequisites

- .NET 9 SDK
- Node.js and npm compatible with the frontend toolchain
- SQL Server or LocalDB, configured for your environment

## Local development (verification required)

1. Clone **this repository** and configure a local SQL Server instance.
2. Supply database connection and JWT signing settings using local secrets or environment variables. Required keys include `Jwt__Secret` (at least 32 UTF-8 bytes) and, for a fresh database, `BootstrapAdmin__Password` (at least 16 characters). Never commit real credentials. Never commit real credentials.
3. From `backend`, run `dotnet restore EnterpriseManagement.sln`, then `dotnet build EnterpriseManagement.sln`.
4. From `backend`, run `dotnet test EnterpriseManagement.sln`.
5. From `frontend`, run `npm install`, `npm run typecheck`, `npm run lint` and `npm run build`.
6. Start the API from `backend/src/EnterpriseManagement.API` with `dotnet run`; start the frontend from `frontend` with `npm run dev`.

> These commands are based on the repository layout and package scripts. Successful execution has **not** yet been independently verified.

## Security and deployment

Do not reuse JWT keys or example credentials. The preparation branch removes the known hard-coded JWT fallback and bootstrap password, requires explicit CORS origins and limits Swagger to Development. These changes have not been build-tested. Before deploying, validate authorization and review committed configuration and Git history for secrets. See `docs/PORTFOLIO_AUDIT.md`.

## Tests and screenshots

Unit and integration test projects exist, but results are not yet verified. Add real screenshots and a working demonstration only after running and validating the application.

## License

See `LICENSE`. Verify ownership and third-party licensing before making the repository public.
