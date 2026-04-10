## Manual QA Checklist

Purpose-built smoke tests to validate the Sporty Gotchi connect experience, avatar state changes, and fallbacks when upstream data is incomplete.

### 1. Desktop Connect Flow
- Start from a clean session (incognito/private window); load the marketing landing page.
- Trigger the connect CTA and authenticate through Strava using desktop browser.
- Confirm redirect returns to the app with the locker screen populated and no console errors.
- Verify training graph renders and the `SportyGotchi` canvas animates without jitter.
- Force refresh and ensure session persists (no repeated auth prompts within 5 minutes).

### 2. Mobile Connect Flow
- Use a mobile simulator or real device; clear cookies/storage.
- Launch via the primary shareable URL; ensure layout adapts (no horizontal scroll).
- Run the Strava OAuth flow end-to-end and confirm the app resumes in the same viewport section post-redirect.
- Toggle between portrait/landscape; avatar and HUD should scale and stay anchored.
- Reopen the app after backgrounding for 2+ minutes; session should remain valid or show a friendly reconnect prompt.

### 3. Missing or Delayed Data Handling
- Mock Strava API responses with `activities: []`; confirm copy updates to “Data pending” (or equivalent) and the avatar shows the idle state.
- Simulate partial metrics (missing pace, HR) and verify fallback values appear (e.g., “—” or greyed icons) without throwing client errors.
- Trigger a slow response (>5s) using devtools throttling; UI should show a loading skeleton rather than blocking the main thread.
- After data arrives, confirm skeletons disappear and metrics animate in only once (no flicker loops).

### 4. Avatar State Transitions
- With full activity data, ensure avatar progresses through the expected states: idle → warming up → active training → recovery.
- Change the underlying metric inputs manually (via mocked data or storybook knobs) and confirm each threshold switch updates the avatar outfit/accessories.
- Validate transitions include easing and do not snap; no overlapping props (e.g., two hats) when switching quickly.
- Confirm locker previews stay in sync with the live avatar state after any transition.

### 5. Error Messaging & Recovery
- Force an OAuth denial/expired token; UI must show a concise error banner with retry CTA.
- Kill network after authentication and ensure the app surfaces a “Cannot reach Strava” message rather than hanging spinners.
- Cause backend 500 response; message should reference temporary issue and log a telemetry event (check console/network tab).
- After any error, press the provided retry/control buttons and confirm the UI can return to the happy path without a full reload.

### Sign-off Criteria
- All flows above completed on both Chrome (latest) and Safari; mobile verified on iOS Safari and Android Chrome.
- No blocking console errors, unhandled promise rejections, or red network entries left unresolved.
- Test notes (dates, browsers, pass/fail) documented alongside this checklist for future regressions.

