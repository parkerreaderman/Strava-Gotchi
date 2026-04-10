# Launch Checklist

## Technical
- [ ] Run `npm run ci` to ensure lint and unit tests pass.
- [ ] `npx prisma migrate deploy` on production database.
- [ ] `npx vercel pull --environment=production` then `npx vercel deploy --prod`.
- [ ] Update Strava app callback to the production domain (`https://sporty-gotchi.vercel.app/api/auth/callback`).
- [ ] Hit `/api/health` on production; confirm `status: ok`.
- [ ] Trigger a Sentry test error (if DSN configured) to verify monitoring.

## Content
- [ ] (Optional) If you add Rive later: place `.riv` files under `public/rive/` per `docs/rive-pipeline.md` and wire CI validation.
- [ ] Capture a 20s screen recording of the avatar reacting to different TSB states.
- [ ] Publish Privacy + Terms links in the marketing site footer.

## Marketing blast
- [ ] Email the beta testers with the public launch link and thank-you discount code (future premium tier).
- [ ] Post on Strava club, Instagram, LinkedIn with the avatar GIF.
- [ ] Schedule Product Hunt or Hacker News “Show HN” if desired.

## Metrics to watch (first 72h)
- Strava connection success rate (from onboarding analytics).
- Error logs for `/api/strava/activities`.
- Uptime monitor hitting `/api/health` every minute.
- Sentry issue volume.

## Rollback
- To roll back, re-run `npx vercel deploy --prod` targeting the previous deployment (`vercel ls` to find the ID).
- Inform users via email + social if there is an incident longer than 15 minutes.

