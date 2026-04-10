# Deploying Sporty Gotchi to Vercel

This guide walks through preparing the project for Vercel, configuring environment variables, enabling Sentry monitoring, and running a scripted first-deploy checklist so you can reproduce the release process.

## 1. Prerequisites

- GitHub repository connected to your Vercel account
- Strava API application with production callback domain ready
- Vercel CLI installed (`npm i -g vercel`) and logged in
- Sentry account with permissions to create auth tokens and DSNs

## 2. Required Environment Variables

Set the following variables in Vercel → Project Settings → Environment Variables. Use the same names shown below so they line up with the Next.js code.

| Variable | Description | Example | Scope |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | OAuth client ID from Strava | `12345` | Preview + Production |
| `STRAVA_CLIENT_SECRET` | OAuth secret from Strava | `shhh-super-secret` | Preview + Production |
| `NEXT_PUBLIC_REDIRECT_URI` | HTTPS callback for Strava OAuth (must match Strava app) | `https://sporty-gotchi.vercel.app/api/auth/callback` | Preview + Production |
| `SENTRY_AUTH_TOKEN` | Token used for uploading source maps (scopes: project:releases, org:read) | `sntrys_...` | Preview + Production |
| `SENTRY_ORG` | Sentry organization slug | `sporty-gotchi` | Preview + Production |
| `SENTRY_PROJECT` | Sentry project slug | `web` | Preview + Production |
| `SENTRY_DSN` | DSN for browser/server error reporting | `https://abc123.ingest.sentry.io/987654` | Preview + Production |

> Tip: run `npx vercel env add` to enter these from the CLI if you prefer.

## 3. Build & Output Settings

Configure the following in Vercel (Project Settings → Build & Development Settings):

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install` (default)
- **Output Directory:** `.vercel/output` (handled automatically by Vercel for Next.js 13+)
- **Serverless Functions Region:** pick the region closest to your primary users; `iad1` (US East) works well for Strava.

## 4. Enable Sentry Monitoring

1. **Bootstrap Sentry in the repo**  
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```  
   This installs `@sentry/nextjs`, adds `sentry.client.config.ts`, `sentry.server.config.ts`, and wires up instrumentation hooks.
2. **Configure runtime options**  
   - Ensure `sentry.edge.config.ts` exists if you plan to run any edge routes.  
   - Verify `sentry.properties` includes your `defaults.url`, `defaults.org`, and `defaults.project`.
3. **Expose DSN and tokens**  
   - Add `SENTRY_DSN` to environment variables (Step 2).  
   - Create a Sentry auth token with `project:releases` and `org:read`.
4. **Upload source maps during build**  
   - Vercel automatically runs `next build`; the Sentry Next.js SDK hooks into this and uploads source maps when `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are present.
5. **Verify events**  
   - After deploy, trigger a test error (`throw new Error('Sentry smoke test')`) in a preview build to confirm monitoring works.

## 5. First Deploy Checklist Script

The following shell script captures the exact sequence for a clean first-time production deploy. Save it as `scripts/first-deploy.sh` if you want to reuse it.

```bash
#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="sporty-gotchi"
PROD_DOMAIN="sporty-gotchi.vercel.app"

echo "🔐 Pulling environment variables from Vercel..."
npx vercel pull --yes --environment=production

echo "🧪 Running checks..."
npm install
npm run lint
npm run build

echo "🌎 Verifying Strava callback matches production domain..."
grep NEXT_PUBLIC_REDIRECT_URI .vercel/.env.production.local

echo "📦 Creating production deployment..."
npx vercel deploy --prod --confirm

echo "✅ Update Strava app callback to https://${PROD_DOMAIN}/api/auth/callback"
echo "📲 Test OAuth login flow in production"
echo "🛡️ Trigger a Sentry test error to confirm monitoring"
```

> Run the script from the repo root. It will stop at the first failure thanks to `set -euo pipefail`, making the deployment checklist reproducible.

## 6. Post-Deploy Monitoring

- Confirm Strava OAuth redirect works end-to-end.
- Watch Sentry for the first few hours; configure alerts for `error` and `issue frequency` to catch regressions quickly.
- Set up a Vercel Deployment Protection rule if you need approvals before production deploys.

With these steps in place, the Sporty Gotchi app can be deployed safely to Vercel with observability via Sentry.

