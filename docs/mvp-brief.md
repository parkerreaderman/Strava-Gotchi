## MVP Brief

### Target Persona
- Time-crunched amateur endurance athlete (marathoner/triathlete) who already logs every workout on Strava and craves a playful readiness signal they can check daily on the web or mobile Safari.

### Single Golden Flow
1. Land on sportygotchi.com and understand the value prop immediately via hero copy + sample avatar.
2. Click “Connect Strava,” complete OAuth, and return to a loading state with clear expectations.
3. Within seconds see their Sporty Gotchi avatar (powered by the latest Strava data) plus a readiness score and short coaching cue.

### Supporting Use Cases
- Review the last 7 days of efforts to confirm why the avatar looks the way it does.
- Tweak basic avatar appearance (name + single accessory) after connecting.
- Revisit the site anytime to see updated state without reconnecting.

### Key Success Metrics
- Signup-to-connect rate ≥ 70% during onboarding cohorts.
- Daily active users (web + mobile web) ≥ 30 within the first beta group.
- Strava sync reliability ≥ 95% of fetch jobs finish without error within 5 minutes of athlete completing an activity.

### Guardrails
- Onboarding must explain Strava permissions and provide “sample data” preview before credentials are granted.
- Avatar state changes should always map to TSB buckets documented in `components/SportyGotchi.tsx` to keep UX predictable.

### Non-Goals (Later Phases)
- Multi-service integrations (Garmin, Apple Health, Oura).
- Advanced avatar customization, wardrobe collections, or marketplaces.
- Long-term training insights, historical trend dashboards, or AI recommendations.
- Social features such as sharing avatars, leaderboards, or squad challenges.

