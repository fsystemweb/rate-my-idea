# AGENTS.md

`rate-my-idea` (rateidea.us) is a TypeScript npm-workspaces monorepo: a React client and an Express/MongoDB API for collecting anonymous feedback on ideas.

## Commands
- Install: `npm install` (CI uses `npm ci`)
- Dev (client and API): `npm run dev`; one side: `npm run dev:client` or `npm run dev:api`
- Build: `npm run build` (or `npm run build:client`, `npm run build:api`)
- Tests: `npm test` (Vitest, run once); client only: `npm run test:client`
- Lint client: `npm run lint:client`
- Format client: `npm run format:client` (check: `npm run format:client:check`)

## Conventions
- Node 20 (CI and Dockerfile), npm 10 with workspaces `apps/*`, Turborepo (`turbo.json`), TypeScript, Prettier (2 spaces, trailing commas).
- `apps/client/`: React + Vite + Tailwind + Radix UI (`pages/`, `components/`, `hooks/`, `services/`, `lib/`, `mocks/`). `@` aliases `apps/client/`.
- `apps/api/`: Express 5 with `routes/` and `utils/`, MongoDB in `db.ts`, `serverless-http` entry in `index.ts`, local server in `dev-server.ts`; validate input with zod.
- `apps/models/`: shared idea and feedback types used by both apps.
- Config comes from `.env` at the repo root; variable names are in `.env.example`. The API needs `MONGODB_URI` (`apps/api/db.ts` throws without it).
- Deploy: client on Vercel (`vercel.json`), API as a Docker image on AWS via `terraform/` (see `DEPLOYMENT.md`).
- CI (`.github/workflows/`) checks the client only: format check, tests and lint, so keep those green.
- Contribution flow: `CONTRIBUTING.md`.

## Boundaries
- Always: run `npm test`, `npm run lint:client` and `npm run format:client:check` before finishing a change.
- Ask first: adding a dependency, changing `terraform/`, the `Dockerfile` or `vercel.json`, changing the data models or API routes.
- Never: commit secrets or read `.env` files; the product is anonymous, so do not add user tracking.
