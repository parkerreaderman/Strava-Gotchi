## Secrets and configuration

### Required variables

| Variable | Where it runs | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Server + browser | Strava OAuth client ID (public). |
| `STRAVA_CLIENT_SECRET` | **Server only** | Strava OAuth client secret. Never expose to the client. |
| `NEXT_PUBLIC_REDIRECT_URI` | Server + browser | Must match Strava app redirect URL exactly (e.g. `http://localhost:3000/api/auth/callback`). |
| `DATABASE_URL` | Server only | Prisma database URL (e.g. SQLite `file:./dev.db`). |

Optional: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` for monitoring and source maps.

### Security practices

1. **Use `docs/env.local.example` as the template** — copy to **`.env.local`** in the project root. `.env*` files are gitignored; do not commit real values.
2. **Never put the client secret in `NEXT_PUBLIC_*`** — anything with that prefix is embedded in client bundles.
3. **Do not use Strava’s “Your Access Token” / “Your Refresh Token”** (on the API application page) as app configuration. Those are personal developer tokens. This app uses **OAuth**: users sign in with Strava and the server stores/refreshes tokens (e.g. httpOnly cookies + database).
4. **If a secret is exposed** (screenshot, chat, public repo): in Strava, **Generate New Client Secret**, then update `.env.local` and production env; reconnect Strava in the app. Treat leaked tokens as revoked.
5. **Production**: set variables in the host’s secret store (e.g. Vercel Environment Variables), not in the repo. Use different Strava apps or strict redirect URLs per environment if you need isolation.
6. **Local SQLite** (`dev.db`) can contain OAuth tokens and PII — keep it out of version control (see `.gitignore`).

### Local workflow

1. Copy `docs/env.local.example` → `.env.local` and fill in Strava client ID and secret.
2. In Strava: set **Authorization Callback Domain** to `localhost` (dev) or your production domain.
3. Run `npx prisma migrate dev` after defining `DATABASE_URL`.
4. Restart `npm run dev` when environment variables change.

### Managed secrets (recommended for production)

- **Vercel**: Project Settings → Environment Variables (Preview / Production). Optionally `npx vercel env pull` for a local `.env.local` (do not commit the pulled file).
- **Doppler / 1Password / similar**: Mirror env in a vault; inject in CI and runtime instead of plaintext in multiple places.

### Rotation checklist

1. Generate a new Strava client secret; update hosting secrets and local `.env.local`.
2. Redeploy or restart the dev server.
3. Users may need to **Connect with Strava** again if refresh fails after rotation.
4. Run `npm run ci` before shipping.
