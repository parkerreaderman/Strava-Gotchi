## Persistence Layer

- **Database**: SQLite (local) via Prisma. Point `DATABASE_URL` to `file:./dev.db` inside `.env`.
- **Models**:
  - `User`: Strava athlete profile and relationships.
  - `StravaToken`: Stores access + refresh tokens plus expiry.
  - `Activity`: Cached 90-day activity summaries for speed + offline metrics.

### Setup
1. Copy `docs/env.local.example` to `.env.local` (project root) and add:
   ```
   DATABASE_URL="file:./dev.db"
   ```
2. Run migrations + generate client:
   ```bash
   npx prisma migrate dev --name init
   ```
3. Seed data automatically through Strava sync; the `/api/strava/activities` endpoint upserts users, tokens, and activities.

### Operational Notes
- Production can swap SQLite for Postgres by changing the provider URL and re-running `prisma migrate deploy`.
- The activities cache includes a SHA-256 checksum so unchanged workouts are skipped.
- All Prisma access goes through `lib/prisma.ts` which memoizes the client for Next.js hot reloads.

