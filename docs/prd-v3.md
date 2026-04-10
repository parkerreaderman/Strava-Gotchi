# Product Requirements Document: Sporty Gotchi v3

> Reference: [How to create a product requirements document (PRD)](https://www.atlassian.com/agile/product-management/requirements)

---

## 1. Project Specifics

| Field | Value |
|-------|-------|
| **Participants** | Product owner, development team |
| **Status** | Planning |
| **Target release** | TBD |

---

## 2. Goals and Business Objectives

**North Star: A simple avatar training game.** Sporty Gotchi is a Tamagotchi-style companion that connects to Strava and turns an athlete's real training data into a visual, playful experience. The avatar reflects fitness (CTL) and fatigue (TSB), evolves as the user trains, and lets them express themselves through outfits and gear. Users can share their avatar with friends and form groups, making progress visible and social.

**Core goals:**

- **Visualize progress** — The avatar is a living mirror of training state: color, expression, and demeanor change based on CTL/TSB. Users see their fitness journey at a glance.
- **Self-expression** — Unlock or purchase outfits and gear to customize the avatar. The avatar becomes a canvas for identity and achievement.
- **Share with others** — Add friends, see each other's avatars, form groups (run clubs, squads). Progress and self-expression are meant to be shared in a fun, low-pressure way.
- **Keep it simple** — One primary view: avatar + status + locker. No clutter; everything else secondary or collapsed.

---

## 3. Background and Strategic Fit

**Existing Sporty Gotchi behavior (v2):** The app connects to Strava and calculates training metrics (CTL, ATL, TSB) from heart-rate and duration data. The character displays one of five fatigue states—fresh, optimal, trained, fatigued, overtrained—with distinct colors and expressions. A Locker lets users equip hats, shirts, shorts, shoes, and backgrounds. Gamification includes level/XP, evolution stages (Rookie → Champion), streaks, challenges, achievements, and rest-day logging. The UI is a 4-column grid: character, training metrics, graph, locker, activities, gamification panel. All outfits are unlocked; no gating.

**v3 focus:** Simplify and recenter around the avatar as a progress mirror and self-expression tool. The avatar *is* the game: it reflects training state and evolves with fitness. Outfits are earned or purchased. Friends and groups enable sharing. UI is reduced to avatar + status + locker; metrics and recovery are secondary or collapsed.

---

## 4. Assumptions

**Technical**

- Strava integration continues to work as-is; no new data sources in v3.
- Prisma/schema abstraction allows switching from SQLite to Supabase when production-ready.
- Sprite sheets and custom artistic assets will be provided; architecture supports pluggable assets.
- Friends/groups require Supabase (or similar) for multi-user data.

**Product**

- Users prefer a glanceable fitness signal over detailed metrics on the main screen.
- Athletes want to share avatars with friends and form groups; privacy controls are sufficient (avatar + level + status only).
- Purchase path for outfits is viable; Stripe/IAP integration can be deferred.

**User**

- Target persona: time-crunched amateur endurance athlete who logs on Strava and wants a playful readiness signal.
- Users are willing to connect Strava and complete basic setup (name, age, sport)

---

## 5. User Stories

### Avatar & Fitness

| ID | Story | Acceptance Criteria | Success Metric |
|----|-------|---------------------|----------------|
| US-1 | As a user, I see my avatar reflect my fitness and fatigue so I know my readiness at a glance. | Avatar color/expression maps to TSB state (fresh → overtrained); one-line status under avatar; no separate fatigue dashboard on main view | Users report understanding state without expanding |
| US-2 | As a user, I see my level tied to my fitness (CTL) so progression feels intuitive. | Level = f(CTL); level updates as Strava data syncs | Level changes correlate with CTL changes |

### Outfits & Locker

| ID | Story | Acceptance Criteria | Success Metric |
|----|-------|---------------------|----------------|
| US-3 | As a user, I unlock outfits by reaching fitness levels so I have goals to work toward. | Each wearable has required level/stage; locker shows locked (lock icon + "Reach Lv X") vs unlocked | Users unlock at least one new item within 2 weeks |
| US-4 | As a user, I can purchase some outfits so I can customize without waiting. | Architecture supports `source: 'unlock' \| 'purchase'`; purchase flow placeholder for Stripe/IAP | N/A (deferred implementation) |
| US-5 | As a user, I equip unlocked/owned items so my avatar reflects my style. | Tap item in locker to equip; equipped items visible on avatar; persisted (localStorage now, Supabase later) | Equipped items persist across sessions |

### Social

| ID | Story | Acceptance Criteria | Success Metric |
|----|-------|---------------------|----------------|
| US-6 | As a user, I add friends so I can see their avatars. | Send/accept friend requests; friend list; discovery via username or link | Friend connections established |
| US-7 | As a user, I view my friends' Sporty Gotchi avatars so we can share our fitness journeys. | Friend avatar shows state + wearables; read-only snapshot; no raw Strava data | Users view friend avatars |
| US-8 | As a user, I form groups (e.g. run club) so we can see each other's avatars. | Create/join groups; group roster with avatars; privacy controls | Groups formed and used |

### UI & Experience

| ID | Story | Acceptance Criteria | Success Metric |
|----|-------|---------------------|----------------|
| US-9 | As a user, I land on a minimal main view so I'm not overwhelmed. | Single column: header (Lv, Friends, Locker, Settings), avatar + status, locker; recovery/activities/challenges collapsed or secondary | Time-to-understanding < 5 seconds |
| US-10 | As a user, I can expand recovery details when I need them so I'm not blocked. | Tap to expand recovery; RestDayLogger accessible when "Need rest?" | Users who need rest can log it |

---

## 6. User Interaction and Design

**Target layout (single column, mobile-first):**

```
┌─────────────────────────────────────────┐
│ Sporty Gotchi | Lv N | [Friends] [Locker] [⚙] │
├─────────────────────────────────────────┤
│                                         │
│           [Avatar + wearables]           │
│       (reflects fitness / fatigue)       │
│                                         │
│     Fresh — Ready to train hard          │
│                                         │
├─────────────────────────────────────────┤
│ My Locker | [unlocked] [locked] ...      │
└─────────────────────────────────────────┘
```

**Design principles:**

1. Avatar = fitness mirror — character state reflects CTL/TSB.
2. One primary view; everything else secondary or collapsed.
3. Pixel/retro aesthetic; reduce cards and borders.
4. Progressive disclosure — expand for details.

**Wireframes / design explorations:** Link here when available.

---

## 7. Questions and Open Items

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| Q1 | Exact CTL-to-level mapping (e.g. 0–20 → Lv1, 20–40 → Lv2)? | Product | Open |
| Q2 | Which wearables are purchasable vs unlock-only? | Product | Open |
| Q3 | Friend discovery: username search, shareable link, or both? | Product | Open |
| Q4 | Group size limits? Invite-only vs open join? | Product | Open |
| Q5 | Supabase schema and migration timing? | Engineering | Blocked on production decision |

---

## 8. What We're Not Doing (Out of Scope for v3)

- **New data sources** — Garmin, Apple Health, COROS.
- **Leaderboards** — Global competitive rankings (friends/avatars yes; leaderboards no).
- **Training plan recommendations** — No AI-generated training plans.
- **New achievement system** — Keep existing achievements; de-emphasize.
- **Rive animations** — Existing pixel art sufficient; no new animation pipeline.

*These may be considered in future releases.*

---

## Appendix: Technical Notes

**Implementation order:**

1. Fitness-based levelling (CTL → level)
2. Locker unlock gating
3. Fatigue-first UI (avatar + one-line status)
4. UI simplification (single column, collapse secondary)
5. Polish (unlock toasts, onboarding, accessibility)
6. Friends and social

**Key files:** See the Sporty Gotchi v3 plan for detailed file-level changes (xp-calculator, evolution-manager, Locker, page layout, wearable-config).

**Related docs:**

- [MVP Brief](mvp-brief.md)
- [Beta Plan](beta-plan.md)
