# Installation Guide

This guide provides detailed instructions for installing and running the **Enterprise Management System (EMS)** in development and production environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Clone / Setup the Project](#step-1-clone--setup-the-project)
- [Step 2: Database Setup](#step-2-database-setup)
  - [Option A: SQL Server LocalDB (Windows dev)](#option-a-sql-server-localdb-windows-dev)
  - [Option B: SQL Server (full instance)](#option-b-sql-server-full-instance)
  - [Option C: Docker](#option-c-docker)
- [Step 3: Backend Setup](#step-3-backend-setup)
- [Step 4: Frontend Setup](#step-4-frontend-setup)
- [Step 5: Environment Configuration](#step-5-environment-configuration)
- [Step 6: Running the Application](#step-6-running-the-application)
- [Step 7: Verifying the Installation](#step-7-verifying-the-installation)
- [Troubleshooting](#troubleshooting)
- [Windows-Specific Notes](#windows-specific-notes)
- [Linux / macOS-Specific Notes](#linux--macos-specific-notes)

---

## Prerequisites

| Component | Version | Notes |
| --- | --- | --- |
| **Node.js** | 20 LTS or newer | Required for the Angular frontend. |
| **npm** | 10+ | Ships with Node.js. |
| **.NET 9 SDK** | 9.0.x | Required to build/run the Web API. |
| **SQL Server** | 2019+ | Express, Developer, or Standard. LocalDB is fine for dev. |
| **Docker** (optional) | 24+ | Required only for the containerized setup. |
| **Git** | 2.40+ | To clone the repository. |

Verify your toolchain:

```bash
node --version
npm --version
dotnet --version
sqlcmd -?            # or: docker --version
```

---

## Step 1: Clone / Setup the Project

```bash
git clone https://github.com/enterprise/ems.git
cd ems
```

The repository layout:

```
ems/
├── src/
│   ├── Backend/        # .NET 9 Web API (clean architecture)
│   └── Frontend/       # Angular 19 SPA
├── docker-compose.yml
├── Dockerfile
├── README.md
└── docs/
```

---

## Step 2: Database Setup

Choose **one** of the following options.

### Option A: SQL Server LocalDB (Windows dev)

LocalDB is bundled with SQL Server Express and is the fastest way to get started on Windows.

1. Confirm LocalDB is installed:

   ```powershell
   sqllocaldb info
   ```

2. Create (or start) an instance:

   ```powershell
   sqllocaldb create EMS
   sqllocaldb start EMS
   ```

3. Use this connection string in `appsettings.json`:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=(localdb)\\EMS;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
   }
   ```

### Option B: SQL Server (full instance)

1. Install SQL Server 2019+ and SQL Server Management Studio (SSMS).
2. Create a database named `EMS` (or let EF Core create it during migration).
3. Use SQL authentication or Windows authentication:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost,1433;Database=EMS;User Id=ems_user;Password=Strong!Pass123;TrustServerCertificate=True"
   }
   ```

### Option C: Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Strong!Pass123" \
  -p 1433:1433 --name ems-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=EMS;User Id=sa;Password=Strong!Pass123;TrustServerCertificate=True"
}
```

---

## Step 3: Backend Setup

```bash
cd src/Backend
dotnet restore
dotnet build
```

Apply database migrations and seed initial data:

```bash
dotnet ef database update --project EMS.Infrastructure --startup-project EMS.Api
```

> If `dotnet ef` is not available, install it once: `dotnet tool install --global dotnet-ef`.

Seed the database (creates the default admin user and reference data):

```bash
dotnet run --project EMS.Api -- --seed
```

> The default admin account is `admin@ems.local` / `Admin@12345`. **Change this password immediately after first login.**

---

## Step 4: Frontend Setup

```bash
cd src/Frontend
npm install
```

The frontend reads its API base URL from `src/environments/environment.ts`. For local development:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

---

## Step 5: Environment Configuration

### Backend — `src/Backend/EMS.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\EMS;Database=EMS;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS",
    "Issuer": "EMS",
    "Audience": "EMS-Client",
    "DurationInMinutes": 60,
    "RefreshTokenDurationInDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:4200"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

> **Security:** Never commit the real `Jwt:Key`. Use user-secrets in dev (`dotnet user-secrets set "Jwt:Key" "..."`) and environment variables in production.

### Frontend — `src/environments/environment.ts` / `environment.prod.ts`

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

For production, set `production: true` and point `apiUrl` at your published API host.

---

## Step 6: Running the Application

**Terminal 1 — Backend:**

```bash
cd src/Backend
dotnet run --project EMS.Api
```

The API listens on `http://localhost:5000` (Swagger at `/swagger`).

**Terminal 2 — Frontend:**

```bash
cd src/Frontend
npm start
```

The SPA is served at `http://localhost:4200`.

---

## Step 7: Verifying the Installation

1. Open http://localhost:5000/swagger — the OpenAPI page should load.
2. Open http://localhost:4200 — the login screen should appear.
3. Log in with `admin@ems.local` / `Admin@12345`.
4. On the dashboard, confirm KPI tiles and charts render (data comes from seed).
5. Navigate to **User Management** and confirm the admin user is listed.
6. Run the test suites:

   ```bash
   dotnet test                     # backend
   cd src/Frontend && npm test     # frontend (headless)
   ```

---

## Troubleshooting

| Symptom | Cause | Resolution |
| --- | --- | --- |
| `A connection was successfully established but then an error occurred during the login process` | SQL Server not reachable / wrong credentials | Verify host, port, and `SA_PASSWORD`. For LocalDB, ensure the instance is started with `sqllocaldb start EMS`. |
| `Cannot connect to API` in the browser | CORS or wrong `apiUrl` | Confirm `Cors.AllowedOrigins` includes `http://localhost:4200` and `apiUrl` matches the API host. |
| `dotnet ef` not recognized | Tool not installed | Run `dotnet tool install --global dotnet-ef`. |
| `The SSL connection could not be established` | Self-signed cert | Add `TrustServerCertificate=True` to the connection string (dev only). |
| Frontend builds but shows blank page | Wrong environment file | Ensure `ng serve` uses `environment.ts`; `ng build --configuration production` uses `environment.prod.ts`. |
| JWT 401 after login | Clock skew / wrong issuer | Ensure server and client clocks are synced; verify `Jwt:Issuer`/`Audience` match the token config. |
| Port 5000/4200 already in use | Another process bound | Change `applicationUrl` in `launchSettings.json` / use `ng serve --port 4300`. |

---

## Windows-Specific Notes

- LocalDB is the recommended dev database (see Step 2, Option A).
- Use **PowerShell** or **Command Prompt**; the commands above are PowerShell-compatible.
- Enable long-path support if you hit `MAX_PATH` errors during `npm install`.
- SQL Server Express + SSMS is the easiest full-instance option.

## Linux / macOS-Specific Notes

- LocalDB is **not** available on Linux/macOS. Use **Option B (SQL Server container)** or **Option C (Docker)**.
- Install the .NET 9 SDK via the Microsoft package feed (`dotnet-install.sh` or your distro package manager).
- On macOS, SQL Server runs only via Docker (no native engine).
- If you use Windows authentication in the connection string, replace it with SQL authentication on non-Windows hosts.
- File paths in `appsettings.json` (e.g., for uploads/logs) should use forward slashes or `Path.Combine` to stay cross-platform.
