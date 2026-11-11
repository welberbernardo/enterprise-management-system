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
