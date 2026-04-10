# Sporty Gotchi

A **gamified fitness companion**: a Tamagotchi-style character that reflects real training load from **Strava**, using fitness and fatigue metrics (CTL, ATL, TSB) similar to common endurance tooling.

App screenshot

## At a glance


|                  |                                                                              |
| ---------------- | ---------------------------------------------------------------------------- |
| **Stack**        | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma + SQLite |
| **Integrations** | Strava API v3 (OAuth), activity sync                                         |
| **CI**           | GitHub Actions — lint + tests (see `docs/ci.md`)                             |


**What it demonstrates:** full-stack OAuth flow, API routes, persisted sessions, domain logic for training metrics, and a cohesive UI around a single “character state” model.

## Repository layout


| Path                 | Purpose                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `app/`               | Routes, layout, global styles; `app/api/` for Strava auth, activities, gamification, health |
| `components/`        | UI pieces (pixel avatar, metrics, settings, collapsible sections)                           |
| `lib/`               | Training metrics, sprite/state helpers, shared UI logic                                     |
| `prisma/`            | Schema and migrations (local SQLite via `DATABASE_URL`)                                     |
| `public/`            | Static assets                                                                               |
| `docs/`              | Env template, security, CI, deploy, persistence, testing notes                              |
| `.github/workflows/` | CI workflow                                                                                 |


## Quick start

1. **Clone** the repo and run `npm install`.
2. **Environment:** copy `docs/env.local.example` to `.env.local` and set Strava client ID/secret, redirect URI, and `DATABASE_URL` (see table in [Setup](#setup) below).
3. **Database:** run `npx prisma migrate dev` (or your usual Prisma workflow) so the app can persist OAuth tokens locally.
4. **Dev server:** `npm run dev` → open [http://localhost:3000](http://localhost:3000).

**Scripts:** `npm run build`, `npm run lint`, `npm run test`, `npm run ci` (lint + test).

## Features

- Dynamic character state driven by calculated form (TSB bands: fresh → overtrained)
- Training metrics dashboard: TSS, CTL, ATL, TSB (Intervals.icu-style methodology)
- Strava connection with rate-limit awareness
- Gamification hooks (achievements, streaks, challenges) via API routes

## Setup

### Strava API credentials

1. Open [Strava API settings](https://www.strava.com/settings/api) and create an app if needed.
2. Note **Client ID** and **Client Secret**.
3. Set **Authorization Callback Domain** to `localhost` for local dev.

### Environment variables

Copy `docs/env.local.example` to `.env.local` in the project root:


| Variable                       | Notes                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Safe to expose in the browser.                                                   |
| `STRAVA_CLIENT_SECRET`         | **Server-only** — never use a `NEXT_PUBLIC_` prefix; never commit.               |
| `NEXT_PUBLIC_REDIRECT_URI`     | e.g. `http://localhost:3000/api/auth/callback` (must match Strava app settings). |
| `DATABASE_URL`                 | e.g. `file:./dev.db` for local SQLite.                                           |


Do **not** paste Strava’s dashboard **“Your Access Token” / “Your Refresh Token”** into env files for normal use; this app uses **OAuth** (“Connect with Strava”) so each user gets proper tokens. For production secrets and rotation, see `docs/secrets.md`.

### Security quick reference


| Do                                                       | Don’t                                                    |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Keep secrets in `.env.local` or your host’s secret store | Commit `.env.local` or share secrets in screenshots/chat |
| Use OAuth in the app for user data                       | Rely on Strava dashboard personal API tokens for the app |
| Put only the **client ID** in `NEXT_PUBLIC_`*            | Put the **client secret** in any `NEXT_PUBLIC_` variable |


Local SQLite (`*.db`) may contain tokens and account data; it stays gitignored.

## How to use

1. Click **Connect with Strava** on the home page.
2. Authorize the app.
3. The character reflects your current training state; metrics use roughly the last 90 days of activities.

## Understanding the metrics

### TSS (Training Stress Score)

Stress score per activity from duration and heart rate (when available). Higher = harder session.

### CTL (chronic training load) — fitness

42-day exponential average of training load. Higher = more long-term fitness.

### ATL (acute training load) — fatigue

7-day exponential average. Higher = more recent fatigue.

### TSB (training stress balance) — form

`CTL - ATL`. Positive tends to mean fresher; negative can mean fatigued but adapting. A common racing “sweet spot” is around +5 to +15 (not medical advice).

## Deployment (e.g. Vercel)

1. Push this repository to GitHub (or another host).
2. Connect the repo in Vercel.
3. Add the same environment variables in **Project Settings → Environment Variables** (keep `STRAVA_CLIENT_SECRET` server-only).
4. Set `NEXT_PUBLIC_REDIRECT_URI` to your production callback URL.
5. In Strava, set **Authorization Callback Domain** to your production domain (no `http://`, no path).

## Roadmap (ideas)

- Apple Health; Garmin / COROS
- Deeper character customization and achievements
- Training recommendations; mobile client

## Troubleshooting

**“No Strava credentials” / session errors**

- Confirm Client ID and Client Secret in `.env.local` (secret is not `NEXT_PUBLIC_`).
- Complete **Connect with Strava** so session cookies are set; a new browser or cleared cookies requires signing in again.

**“Failed to fetch activities”**

- Check network; try disconnect and reconnect.
- You may be hitting Strava rate limits (e.g. 100 requests per 15 minutes).

**Character not updating**

- Ensure you have activities in the last ~90 days; metrics stabilize with a few weeks of consistent data.

## Further reading

- [Strava API documentation](https://developers.strava.com/)
- [Training load concepts (Intervals.icu)](https://www.intervals.icu/blog)
- [Next.js documentation](https://nextjs.org/docs)

## License

MIT — see [LICENSE](LICENSE).

---

Built for athletes who like their training data with a bit of character.