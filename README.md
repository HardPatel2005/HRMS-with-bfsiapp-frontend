# HRMS Frontend (Angular 21)

This repository contains the HRMS frontend application built with Angular CLI 21.

Repository URL:
- https://github.com/HardPatel2005/HRMS-with-bfsiapp-frontend.git

Backend repository used by this frontend:
- https://github.com/HardPatel2005/HRMS-backendapiwith-bfsi.git

## 1. Prerequisites

Install the following tools:
- Node.js 20+
- npm 10+
- Git

Optional:
- Docker Desktop (for container run)

Verify versions:

```bash
node -v
npm -v
```

## 2. Clone and install

```bash
git clone https://github.com/HardPatel2005/HRMS-with-bfsiapp-frontend.git
cd HRMS-with-bfsiapp-frontend
npm ci
```

## 3. Configure backend API URL for local run

This frontend reads API URL from:
- `src/environments/environment.ts`

Current default is:

```ts
apiUrl: 'https://localhost:44313'
```

If your backend runs on another port (for example `https://localhost:7254`), update `apiUrl` accordingly.

## 4. Start development server

```bash
ng serve
```

Open:
- http://localhost:4200

## 5. Build for production

```bash
ng build
```

Output folder:
- `dist/BFSI-Frontend`

Production environment file:
- `src/environments/environment.production.ts`

Before production build/deploy, set `apiUrl` in that file to your deployed backend URL.

## 6. Run with Docker

Build image:

```bash
docker build -t hrms-frontend:latest .
```

Run container:

```bash
docker run -d -p 4000:4000 --name hrms-frontend hrms-frontend:latest
```

Open:
- http://localhost:4000

Stop and remove:

```bash
docker stop hrms-frontend
docker rm hrms-frontend
```

## 7. Tests

Run unit tests:

```bash
ng test
```

## 8. CI/CD workflows in this repo

- `.github/workflows/ci.yml`
	- Runs on push and pull request
	- Installs dependencies, builds app, runs tests

- `.github/workflows/docker-release.yml`
	- Runs on tag push such as `v1.0.0`
	- Builds and pushes Docker image to GHCR

Create a release tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 9. Troubleshooting

- `401` or API errors:
	- Check frontend `apiUrl` matches running backend URL/port.

- CORS errors:
	- Ensure backend allows `http://localhost:4200` in CORS policy.

- Angular build warnings for size/CommonJS:
	- These are warnings, not hard failures.

## 10. Related deployment guide

For Neon + Render + full CI/CD flow, see:
- `docs/CI_CD_RENDER_NEON_GUIDE.md`
