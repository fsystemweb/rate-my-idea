<h1 align="center">Rate my Idea</h1>

<p align="center">
  <img src="public/logo.png" alt="logo" width="120px" height="120px"/>
  <br>
  <em>Collect anonymous feedback on ideas, products, or events through conversational forms. </br>
  Get real-time analysis, visual dashboards, and trending insights, no user tracking.</em>
  <br>
</p>

<p align="center">
  <a href="https://rateidea.us/"><strong>rateidea.us</strong></a>
  <br>
</p>

<p align="center">
  <a href="CONTRIBUTING.md">Contributing Guidelines</a>
  ·
  <a href="https://github.com/fsystemweb/rate-my-idea/issues">Submit an Issue</a>
  ·
  <a href="DEPLOYMENT.md">Deployment</a>
  <br>
  <br>
</p>

<hr>

## Development Setup

### Prerequisites:

- Node 20 
- npm (the project uses npm as package manager)
- A MongoDB instance (optional for using the real server; otherwise runs in mock mode)

### Install dependencies:

```bash
npm install
```

### Run the app in development mode:

```bash
npm run dev
```


## Environment variables

The server reads configuration from environment variables. Create a `.env` file in the project root (it is not included here).

Important variables:

- MONGODB_URI - MongoDB connection string (optional for dev; required to use real DB)
- VITE_API_URL - API url for the client webapp
- DEV - Optional set true if you want to start without mongodb

Example `.env`:

```
MONGODB_URI=mongodb://localhost:27017/rate-my-idea
VITE_API_URL=https://api.com/api
DEV=true
```

## Useful scripts

Scripts are defined in `package.json`:

- `dev` - Run client and api dev enviroment
- `build` - Build client and server bundles (`build:client` + `build:api`)
- `test` - Run Vitest

Client-specific scripts (added):

- `format:client` - Run Prettier.
- `format:client:check` - Run Prettier in check mode.
- `test:client` - Run test.
- `lint:client` - Run eslint.

Run them with npm, e.g. `npm run dev`.

## Project structure (high level)
- `apps/` - Apps folder container
  - `client/` - React app (tsx, components, pages, hooks, services)
  - `api/` - Express server, routes, DB connection
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