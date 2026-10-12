# ClearTok — TikTok Repost Remover

ClearTok is a browser extension for automating the removal of reposts from your own TikTok account. This repository also contains its companion website and a Cloudflare Worker API.

## Repository structure

| Directory | Purpose | Stack |
| --- | --- | --- |
| [tiktok-remover-extension](./tiktok-remover-extension/) | Browser extension with a side panel, removal controls, progress updates, and localized messages | JavaScript, Chrome Extension Manifest V3 |
| [tiktok-remover-frontend](./tiktok-remover-frontend/) | Companion website, blog, waitlist, and statistics pages | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| [tiktok-remover-backend](./tiktok-remover-backend/) | API for sessions, event tracking, feedback, and statistics | TypeScript, Hono, Cloudflare Workers, D1 |

## Getting started

Clone the repository:

```sh
git clone https://github.com/BrittAbdula/tiktokrepostremover.git
cd tiktokrepostremover
```

### Browser extension

The extension is plain JavaScript and does not require a build step.

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `tiktok-remover-extension` directory.
4. Open TikTok in your browser and sign in to your account.
5. Open the ClearTok extension side panel to access removal controls.

The extension relies on TikTok page selectors. Changes to TikTok's interface can affect repost detection and removal.

### Frontend

Install Node.js and pnpm, then run:

```sh
cd tiktok-remover-frontend
pnpm install
pnpm dev
```

Open the local URL printed by Vite.

Available commands:

```sh
pnpm build       # Build the website into dist/
pnpm preview     # Preview the production build
pnpm lint        # Run ESLint
```

The waitlist API uses `VITE_API_BASE_URL`, falling back to `https://api.tiktokrepostremover.com`. To point waitlist requests at a local backend, create `.env.local` inside `tiktok-remover-frontend`:

```dotenv
VITE_API_BASE_URL=http://localhost:8787
```

Other website and extension requests may use hardcoded URLs; inspect their configuration before connecting them to your own backend.

### Backend

```sh
cd tiktok-remover-backend
pnpm install
pnpm exec wrangler d1 execute tiktok-repost-stats --local --file=./schema.sql
pnpm dev
```

The Worker uses the D1 binding `DB`, configured in `wrangler.toml`. The command above initializes the local database.

For your own deployment, create a D1 database in your Cloudflare account and update `database_name` and `database_id` in `wrangler.toml`. Initialize that database using `schema.sql` before deploying:

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 execute <your-database-name> --remote --file=./schema.sql
pnpm deploy
```

To regenerate Cloudflare binding types:

```sh
pnpm cf-typegen
```

## Development notes

- The frontend and backend have separate package manifests and lockfiles; install dependencies in each directory.
- The extension's API base URL is configured in `tiktok-remover-extension/api-service.js`. Review `background.js` and `manifest.json` host permissions when changing API hosts.
- Local development files, dependencies, and credentials should stay out of commits. The frontend and backend retain their own `.gitignore` files.

## Contributing

Bug reports and pull requests are welcome. Include reproduction steps for bugs and a description of how you checked any changes.

## License

This project is licensed under the [MIT License](./LICENSE).
