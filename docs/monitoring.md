## Monitoring & Health Checks

### Structured logging
- `lib/logger.ts` wraps `console` calls with JSON payloads (`level`, `message`, `timestamp`, optional metadata).
- Server routes call `logger.info|warn|error`. Vercel captures stdout/stderr so you can stream these into Logtail, BetterStack, etc.
- To forward logs locally, run `npm run dev 2>&1 | tee sporty.log`.

### Sentry (optional but recommended)
1. Install `@sentry/nextjs` via `npx @sentry/wizard@latest -i nextjs`.
2. Add `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (see `docs/secrets.md`).
3. Trigger a test exception in Preview after deploy to ensure the DSN works.

### Health endpoint
- `GET /api/health` returns:
  ```json
  {
    "status": "ok",
    "components": {
      "api": "ok",
      "database": "ok",
      "stravaCredentials": "ok"
    },
    "timestamp": "2025-01-01T00:00:00.000Z"
  }
  ```
- Use Vercel cron or an external uptime monitor (Better Stack, Pingdom) to poll this endpoint every minute. A `503` indicates degraded service.

### Suggested alerts
- **Sentry**: alert on `issue.frequency` > 5/min or `crash_free_users` < 95%.
- **Uptime**: page if `/api/health` fails twice consecutively.
- **Strava quota**: log `rateLimit` payloads from `/api/strava/activities` and visualize in your log pipeline to know when you’re close to 600 requests/day.

