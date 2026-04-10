# Closed Beta Plan

## Goal
Validate the MVP flow (connect Strava → avatar/readiness view) with 20–30 friendly athletes before public launch.

## Timeline
| Week | Milestone |
| --- | --- |
| 0 | Recruit testers, send onboarding instructions |
| 1 | Observe first-time connection, capture friction |
| 2 | Iterate on blockers, run follow-up survey |

## Recruitment
- Channels: local run clubs, Strava friends, existing newsletter subscribers.
- Ask for: name, primary sport, weekly volume, device type (desktop/mobile).
- Tooling: simple Airtable/Google Sheet with status (invited → connected → feedback logged).

## Onboarding packet
1. Link to staging deployment (Vercel preview).
2. Steps: connect Strava, complete setup, explore dashboard.
3. Reminder about permissions + privacy (link to `/policies/privacy`).
4. Provide support email + Calendly for live walkthroughs.

## Feedback loop
- **Form**: Google Form or Typeform capturing:
  - Ease of connecting Strava (1–5)
  - Avatar clarity (“did the state match how you feel?”)
  - Desired improvements
  - Device/browser details
- **Slack/Discord**: optional private channel for async check-ins.
- **Interview script**: 15-min call covering onboarding, dashboard comprehension, animation delight factor.

## Success metrics
- ≥80% of testers finish Strava connection on first attempt.
- ≥70% report avatar/readiness as “useful” (4 or 5/5).
- Collect at least three qualitative quotes for marketing.

## Issue tracking
- Log bugs/requests in GitHub Issues with `beta` label.
- Categorize severity (blocker, high, medium, polish).
- Review twice per week and feed actionable fixes into the backlog.

## Exit criteria
- All high/blocker issues resolved.
- Consent + privacy messaging confirmed understandable.
- Avatar/readiness experience stable on target browsers (pixel UI today; Rive is optional future work per `docs/rive-pipeline.md`).

