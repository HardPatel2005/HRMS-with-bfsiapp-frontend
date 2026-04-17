# HRMS End-to-End CI/CD and Deployment Guide

This guide covers local development, Docker usage, GitHub Actions pipelines, Neon integration, and deployment on Render using free tiers.

## 1. Repository setup

You have two repositories:
- Frontend: https://github.com/HardPatel2005/HRMS-with-bfsiapp-frontend.git
- Backend: https://github.com/HardPatel2005/HRMS-backendapiwith-bfsi.git

## 2. Local prerequisites

Install:
- Node.js 20+
- npm 10+
- .NET SDK 8
- Docker Desktop

Optional for local DB:
- PostgreSQL local instance

## 3. Frontend local run

In frontend repo:
1. npm ci
2. ng serve
3. Open http://localhost:4200

## 4. Backend local run

In backend repo:
1. dotnet restore
2. dotnet build
3. dotnet run
4. Open Swagger (for local profile): https://localhost:7254/swagger

## 5. Docker local run

### Frontend

In frontend repo:
1. docker build -t hrms-frontend:local .
2. docker run -d -p 4000:4000 --name hrms-frontend hrms-frontend:local
3. Open http://localhost:4000

### Backend

In backend repo:
1. docker build -t hrms-backend:local .
2. docker run -d -p 8080:8080 --name hrms-backend \
   -e ASPNETCORE_ENVIRONMENT=Production \
   -e ConnectionStrings__DefaultConnection="<postgres-connection-string>" \
   -e JwtSettings__SecretKey="<32+ char secret>" \
   -e JwtSettings__Issuer="BFSIApi" \
   -e JwtSettings__Audience="BFSIFrontend" \
   hrms-backend:local
3. Open http://localhost:8080/health

## 6. GitHub Actions now available

### Frontend repo
- .github/workflows/ci.yml
  - Runs npm ci, build, and tests on push/PR
- .github/workflows/docker-release.yml
  - Builds and pushes Docker image to GHCR on tag push (v*)

### Backend repo
- .github/workflows/ci.yml
  - Restores/builds .NET app and validates Docker build on push/PR
- .github/workflows/docker-release.yml
  - Builds and pushes Docker image to GHCR on tag push (v*)
- .github/workflows/neon-pr-branches.yml
  - Creates Neon branch on PR open/sync/reopen
  - Deletes branch on PR close
  - Uses GitHub repository variable/secret:
    - vars.NEON_PROJECT_ID
    - secrets.NEON_API_KEY

## 7. Neon setup for backend

In Neon:
1. Create project and production branch (already done)
2. Copy connection string for backend service

In backend Render service environment variables:
- ConnectionStrings__DefaultConnection = <Neon connection string>
- Database__ApplyMigrationsOnStartup = true (first deployment), then set to false

Tip:
- Use SSL-enabled Neon connection string in production

## 8. Render deployment (free-tier friendly)

### Backend Render service

Create a Web Service from backend repo with:
- Environment: Docker
- Dockerfile path: ./Dockerfile
- Port: 8080

Set environment variables:
- ASPNETCORE_ENVIRONMENT=Production
- ASPNETCORE_URLS=http://0.0.0.0:8080
- ConnectionStrings__DefaultConnection=<Neon connection string>
- JwtSettings__SecretKey=<strong 32+ chars>
- JwtSettings__Issuer=BFSIApi
- JwtSettings__Audience=BFSIFrontend
- Cors__AllowedOrigins=https://<frontend-render-domain>
- AppSettings__BaseUrl=https://<frontend-render-domain>
- OAuth__Google__ClientId=<client id>
- OAuth__Google__ClientSecret=<client secret>
- SmtpSettings__Host=<smtp host>
- SmtpSettings__Port=<smtp port>
- SmtpSettings__Username=<smtp user>
- SmtpSettings__Password=<smtp password>
- SmtpSettings__FromEmail=<from email>
- SmtpSettings__FromName=<from name>
- EncryptionSettings__Key=<32-char encryption key>

Verify:
- https://<backend-render-domain>/health

### Frontend Render service

Create a Web Service from frontend repo with:
- Environment: Docker
- Dockerfile path: ./Dockerfile
- Port: 4000

Before deployment:
1. Update src/environments/environment.production.ts with backend Render URL
2. Commit and push

Verify:
- https://<frontend-render-domain>

## 9. Release flow with tags

For each repo:
1. git tag v1.0.0
2. git push origin v1.0.0

Result:
- docker-release workflow runs
- Image pushed to ghcr.io/<owner>/<repo>:v1.0.0 and latest

## 10. PR preview DB flow (backend)

When PR opens:
- Neon branch auto-created by workflow

When PR closes:
- Neon branch auto-deleted

Use this for safe schema experimentation in pull requests.

## 11. Security checklist before public release

- Rotate any secrets previously committed in appsettings
- Keep production secrets only in Render/GitHub secrets
- Keep CORS restricted to known frontend domains
- Keep JwtSettings__SecretKey strong and unique
- Do not log connection strings or private keys

## 12. Suggested learning path

1. Trigger CI by opening a PR in frontend and backend
2. Trigger Docker release by tagging v1.0.0 in both repos
3. Deploy backend to Render with Neon
4. Deploy frontend to Render and connect to backend URL
5. Validate login, dashboard load, and protected API routes
