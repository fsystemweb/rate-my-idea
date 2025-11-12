# Rate My Idea


A small full-stack Vite + React + Express project for collecting and rating ideas. This repo contains a client (React + TypeScript + Vite) and a server (Express + MongoDB) with routes for ideas and feedback, plus a mock API for local development.

## Table of contents

- What is this
- Features
- Tech stack
- Quickstart
- Environment variables
- Useful scripts
- Project structure
- Contributing
- License

## What is this

Rate My Idea is an example application for submitting ideas and collecting feedback. The project includes a responsive UI in `client/` and a lightweight Express server in `server/` that persists data to MongoDB.

## Features

- Submit, update and delete ideas
- Leave feedback for ideas
- Simple dashboard endpoints for idea analytics
- Mock API support for development

## Tech stack

- Frontend: React + TypeScript + Vite
- UI: Tailwind CSS, Radix UI primitives
- Backend: Express, MongoDB
- Tooling: npm, Vitest, Prettier, TypeScript

## Quickstart (local)

Prerequisites:

- Node 18+ (recommended)
- npm (the project uses npm as package manager)
- A MongoDB instance (optional for using the real server; otherwise runs in mock mode)

Install dependencies:

```bash
npm install
```

Run the app in development mode:

```bash
npm run dev
```

This runs the Vite dev server (see `package.json` scripts). The server code will attempt to connect to MongoDB on first request; if the database is not available the server falls back to mock data mode to keep the UI functional during development.

Build for production:

```bash
npm run build
```

Start the built server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Format code:

```bash
npm run format.fix
```

Type check:

```bash
npm run typecheck
```

## Environment variables

The server reads configuration from environment variables. Create a `.env` file in the project root (it is not included here).

Important variables:

- MONGODB_URI - MongoDB connection string (optional for dev; required to use real DB)
- PORT - Port to run the server on (defaults to 3000 in built server)
- PING_MESSAGE - Optional message returned by the `/api/ping` endpoint

Example `.env`:

```
MONGODB_URI=mongodb://localhost:27017/rate-my-idea
PORT=3000
PING_MESSAGE=hello
```

## Useful scripts

Scripts are defined in `package.json`:

- `dev` - Run Vite dev server
- `build` - Build client and server bundles (`build:client` + `build:server`)
- `start` - Run the built server (`node dist/server/node-build.mjs`)
- `test` - Run Vitest
- `format.fix` - Run Prettier to format code
- `typecheck` - Run TypeScript compiler

Client-specific scripts (added):

- `format:client` - Run Prettier.
- `format:client:check` - Run Prettier in check mode.
- `test:client` - Run test.
- `lint:client` - Run eslint.

Run them with npm, e.g. `npm run dev`.

## Project structure (high level)

- `client/` - React app (tsx, components, pages, hooks, services)
- `server/` - Express server, routes, DB connection
- `shared/` - Shared utilities or API types used by both client and server
- `public/` - static resources and hosting helpers

## Contributing

Contributions are welcome. A minimal contribution workflow:

1. Fork the repository
2. Create a branch for your feature or fix
3. Run and update tests where applicable
4. Open a pull request describing your changes

If you'd like, open an issue first to discuss larger changes.

## License

MIT