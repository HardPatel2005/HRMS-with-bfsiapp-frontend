# BFSIFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Docker

Build the Docker image:

```bash
docker build -t bfsi-frontend:latest .
```

Run the container:

```bash
docker run -d -p 4000:4000 --name bfsi-frontend bfsi-frontend:latest
```

Open the app at `http://localhost:4000`.

Stop and remove container:

```bash
docker stop bfsi-frontend && docker rm bfsi-frontend
```

## CI/CD (GitHub Actions)

- CI workflow: `.github/workflows/ci.yml`
	- Runs on every push and pull request
	- Installs dependencies, builds app, and runs tests

- Docker release workflow: `.github/workflows/docker-release.yml`
	- Runs on tag push like `v1.0.0`
	- Builds Docker image and pushes to GHCR (`ghcr.io/<owner>/<repo>`)

Create a release image:

```bash
git tag v1.0.0
git push origin v1.0.0
```

After that, pull and run the released image:

```bash
docker pull ghcr.io/<owner>/<repo>:v1.0.0
docker run -d -p 4000:4000 ghcr.io/<owner>/<repo>:v1.0.0
```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
