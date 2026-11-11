# Portfolio readiness audit — 2026-11-11

**Status: NOT READY FOR PUBLIC RELEASE.** This is a targeted static review, not a complete security assessment or successful build certification.

## Verified observations

- The frontend package manifest specifies React 18, TypeScript, Vite and Tailwind, contradicting the previous README's Angular 19 claims.
- The API project targets `net9.0`.
- The solution separates API, Application, Core and Infrastructure, with unit and integration test directories.
- The old README contained placeholder demo URLs, a clone URL for another repository, an unverified passing-build badge and sample administrative credentials.
- `backend/src/EnterpriseManagement.API/Program.cs` contains a hard-coded JWT fallback signing key and allows a wildcard CORS fallback when no origins are configured.
- Swagger middleware is enabled unconditionally in `Program.cs`.
- JWT settings exist in committed `appsettings.json` and `appsettings.Development.json`. Treat values as potentially exposed until verified; rotate any real or reused secrets. **Do not copy actual values into issues or documentation.**
- `deployment/docker-compose.yml` refers to `./backend` and `./frontend` relative to the deployment directory; inspect build contexts and Dockerfile COPY paths.
- The deployment health checks refer to `/health`; endpoint availability was not established by this review.

## Required before publication

1. Inventory secret-bearing files and Git history, including appsettings, .env files, SQL seeds, Docker and CI configuration; revoke and rotate exposed credentials.
2. Remove JWT fallback secrets, validate key presence/strength at startup and restrict CORS origins in production.
3. Review authorization on all controllers and sensitive operations, file uploads, refresh tokens and audit logging.
4. Validate build and tests: `dotnet restore/build/test`, `npm install/typecheck/lint/build`.
5. Correct Docker build contexts and validate containers/health checks if Docker is used.
6. Verify screenshots, sample data and documentation; never publish customer or employer proprietary information.
7. Only after clearance, create a separate sanitized public portfolio repository or explicitly approve making this one public.

## Portfolio presentation

Suggested title: **Enterprise Management System | ASP.NET Core 9, React & SQL Server**

Suggested description: **A full-stack enterprise management application organized into API, application, domain and infrastructure layers, with a React/TypeScript frontend and SQL Server persistence.**

Avoid claiming deployment, test coverage, security certification or production readiness without evidence.

## Preparation branch changes (unverified)

- Removed the JWT fallback key from API startup and cleared committed JWT signing values in both appsettings files. The app now requires an externally supplied signing secret of at least 32 UTF-8 bytes.
- Replaced permissive CORS fallback with explicit origins and limited Swagger middleware to Development.
- Removed the hard-coded bootstrap administrator password. Fresh database seeding now requires `BootstrapAdmin__Password` of at least 16 characters. Existing seeded administrators are **not** automatically reset and must be rotated separately.
- These changes are not a substitute for scanning Git history, rotating credentials or running the build and tests.
- **Additional finding:** the original database initializer granted all permissions to Administrator, Manager and Staff roles. The preparation branch now seeds reduced permissions for Manager and Staff on **new databases only**. Existing databases need a separately reviewed migration, and each endpoint still needs authorization tests.

## Authorization findings and remediation (2026-11-11)

- **Critical:** The anonymous registration endpoint accepted a caller-controlled role ID. The preparation branch now requires the `Users.Manage` permission for registration; existing authenticated user management remains available via `UsersController`. This changes the public signup behavior intentionally.
- **Critical:** Self-service profile update accepted role and active-status fields and wrote them to the user record. The preparation branch now ignores these fields in `AuthService.UpdateProfileAsync`; administrative user management remains separate. The request DTO still contains these fields and should be split into a dedicated profile DTO in a follow-up change.
- **Important:** The password reset flow generates a token but does not persist a token verification record or expose a verified reset-completion flow. Do not claim password reset is functional or secure until completed.
- **Important:** File upload accepts arbitrary extensions and does not inspect content. Restrict types, enforce per-file limits, scan uploads, and keep files outside publicly served paths before production use.
- **Important:** Existing database roles and bootstrap credentials are not automatically migrated or rotated.

## Automated verification

A pull-request workflow has been added at `.github/workflows/portfolio-verification.yml` for .NET build/unit tests and React typecheck/lint/build. **No successful CI run has been observed.** GitHub may require workflow approval or default-branch registration before the new workflow can run. The repository currently lacks an npm lockfile; the workflow temporarily uses `npm install` rather than reproducible `npm ci`.

## Release gate

Do not merge or publish solely based on static edits. Require successful build and test runs, manual authorization regression tests (anonymous registration, self-role change, refresh and revoke), verified secret rotation, container checks, and permission review.

## Additional hardening (2026-11-11)

- Added a default authenticated-user fallback policy to the API. Explicit `[AllowAnonymous]` endpoints remain public; audit them individually.
- Upload endpoint now rejects empty files, files over 5 MiB and extensions outside PDF/JPG/JPEG/PNG. This is **not** content-type or magic-byte validation and does not replace antivirus scanning or a secure object storage design.
- Added a unit regression test verifying that profile updates cannot change the caller's role or activation status. The test has **not** been executed.
- Important: Existing `AuthServiceTests` still use a fixed test-only password and test signing key; these are not production credentials, but secret scanners may flag them.
- Docker deployment is still not corrected: Compose build contexts, Dockerfile paths and runtime health checks need a separate verified fix.
- CI is not confirmed to have run. A successful workflow and manual review are release prerequisites.

## CI observations (2026-11-11)

- GitHub Actions run `43030388009` completed with backend restore, build and unit tests passing; frontend installation and TypeScript checks passing.
- Frontend ESLint reported **0 errors and 69 warnings**. The `npm run lint` script uses `--max-warnings 0`, so this remains a failing quality gate. Do not suppress the warnings or claim the workflow is green.
- The React production build was skipped because lint previously ran before build. CI now runs the build before strict lint so both outcomes can be observed independently. Await a run of the updated workflow.
- Dockerfile and Compose changes are untested in containers. The frontend lacks a committed npm lockfile, so installs are not reproducible yet. Review and commit a generated lockfile, then switch CI and Docker to `npm ci`.
- Do not publish or merge before security regression tests, integration tests and secret/history review.

## Follow-up fixes (2026-11-11 afternoon)

- Latest completed run examined: `43045527426`, backend build/tests and frontend TypeScript/production build passed; strict ESLint failed with **2 warnings** (React Fast Refresh mixed export in ReportPage and unused useNotification in UserDetail).
- Split report metadata into `frontend/src/pages/reports/reportTypes.ts` and updated Reports.tsx import; removed unused UserDetail import. Await a successful run for the latest commit.
- RefreshTokenAsync now revokes a consumed refresh token before minting a new one. **Outstanding:** concurrency-safe atomic token consumption and a regression test for replay/races. This change has not yet been verified by CI.
- Password-reset flow remains incomplete: generated reset token is not persisted/validated. Do not advertise this feature as secure or complete.

## CI and deployment follow-up (2026-11-11)

- GitHub Actions run [43050052786](https://github.com/welberbernardo/enterprise-management-system/actions/runs/43050052786) passed backend restore/build/unit tests and frontend typecheck/build/strict lint, including refresh token replay regression coverage.
- Fixed nginx's nonexistent `app` user, preserved `/api/` path on proxying, and allowed the container's plain HTTP `/health` check.
- Updated Compose to avoid publishing SQL Server, backend, and frontend directly to host ports; added required bootstrap-admin password and explicit CORS origin. Corrected the SQL Server healthcheck tool path and escaped the container environment variable.
- Replaced realistic example passwords and JWT secrets with obvious placeholders in `deployment/.env.example`.
- **Not validated:** Docker build, Compose startup, SQL Server image healthcheck compatibility, TLS certificates, schema migrations, and end-to-end API/browser integration. The HTTPS nginx server requires externally provisioned `/etc/nginx/ssl/fullchain.pem` and `privkey.pem`; without them it cannot start. Do not deploy this Compose stack as production-ready yet.
- Refresh token rotation test covers sequential replay, **not atomic concurrent reuse**. Password reset is incomplete; do not advertise it as production-ready.

## Integration hardening (2026-11-11)

- CI now includes Compose configuration validation, backend/frontend Docker image builds, and Nginx configuration syntax check using an ephemeral self-signed test certificate. These jobs were still running when this note was written; no full Docker Compose startup has been verified.
- Fixed frontend logout to use the implemented `POST /api/auth/revoke` endpoint rather than the nonexistent `/auth/logout` endpoint. Revocation is best effort and local credentials are cleared immediately.
- Changed `POST /api/auth/change-password` to require an authenticated user rather than an administrative Users.Manage permission; the service verifies the current password.
- Removed unused SQL Server initialization mount and unsupported `MSSQL_DB` environment variable from Compose; EF Core migrations are invoked at API startup.
- **Outstanding:** password reset endpoint is absent although a frontend reset page exists; never claim that reset is functional. Concurrent refresh-token reuse requires atomic database-level protection. Full Docker runtime, TLS provisioning and integration tests remain unverified.

## Docker CI investigation (2026-11-11)

- Run [43051049792](https://github.com/welberbernardo/enterprise-management-system/actions/runs/43051049792) completed successfully for backend tests, frontend typecheck/build/lint, Docker Compose configuration and both backend/frontend Docker image builds.
- The only failing step was Nginx configuration validation (exit 127): the CI command attempted to invoke `openssl` inside `nginx:alpine`, where it was unavailable.
- The workflow now generates a temporary self-signed certificate on the GitHub Actions runner and mounts it read-only for `nginx -t`. Await the next completed CI run before claiming this step passes.
- Docker images building successfully does **not** demonstrate that the application, database, proxy, and HTTPS stack start and function together.

## Verified current status — 2026-11-11 (supersedes earlier historical snapshots)

The entries above are a chronological audit trail. Statements such as "not yet build-tested" and "CI has not run" reflect earlier points in time and are **not the current state**.

- GitHub Actions run [43058882386](https://github.com/welberbernardo/enterprise-management-system/actions/runs/43058882386) passed all three jobs: backend build/unit tests, frontend typecheck/build/strict lint, and Docker image/Compose/Nginx syntax validation.
- Pull requests #1–#6 have been merged into `master`; PR #6 removed the LocalDB connection string from base `appsettings.json` and requires explicit database configuration. The Development-specific LocalDB configuration remains for local development.
- Branch `master` has an active ruleset requiring pull requests, resolved conversations and all three status checks; force pushes and deletions are blocked. The workflow also runs on pushes to `master`.
- The previous forgot-password endpoint did not implement redeemable reset tokens. It now returns 503 and the frontend displays that self-service recovery is unavailable; **password reset is not implemented**.
- Production Compose now requires a read-only host directory `TLS_CERT_DIR` containing `fullchain.pem` and `privkey.pem`. CI validates configuration with a test-only certificate, not production certificate issuance or renewal.
- The repository is currently **public**. This audit does not establish that its entire Git history or all dependencies are free of secrets or proprietary material. Review historical commits and rotate any exposed credentials.
- **Still unverified:** full Docker Compose startup, SQL Server readiness and migrations in a clean environment, authenticated browser/API end-to-end flows, concurrency-safe refresh token consumption, password reset implementation, and comprehensive security testing. Do not represent this as a production-certified application.
