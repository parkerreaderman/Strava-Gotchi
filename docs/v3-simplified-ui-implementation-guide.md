# Sporty Gotchi v3 — Simplified UI: Executable Implementation Guide

This guide implements the **revised simplified UI** (Phases 3–4) with design cues from the provided references. Execute steps in order; each step is testable.

---

## Running in Cursor (agents, rules, skills)

- **Runbook**: [v3-simplified-ui-runbook.md](v3-simplified-ui-runbook.md) — how to execute this plan with Cursor agents (single run or 4 phased runs), exact prompts, and verification.
- **Rule**: `.cursor/rules/v3-simplified-ui.mdc` — provides v3 UI context when editing `app/page.tsx`, SettingsPanel, CollapsibleSection, MetricCard, Locker, SportyGotchi, training-metrics, state-theme. Open one of these files so the rule applies.
- **Skill**: `.cursor/skills/v3-simplified-ui/SKILL.md` — executor skill. In Composer, use `@v3-simplified-ui` or say "follow the skill in .cursor/skills/v3-simplified-ui/SKILL.md" and reference this guide.

---

## Design Reference Mapping

| Reference | Applied to Sporty Gotchi |
|-----------|---------------------------|
| **Weather app (Sydney)** | **State-driven full-page gradient** — fatigue state (fresh / optimal / trained / fatigued / overtrained) drives background gradient and mood, like "Clear and sunny" vs "Heavy rain." One hero: avatar + one-line status. |
| **lab. (minimal brand)** | **Slim header** — logo + Lv badge + few actions (Friends, Locker, Settings). No clutter; hamburger/menu for overflow. Single focal area (avatar as "hero image"). |
| **Exploring Minds / card layout** | **Secondary content as cards** — Recovery, Challenges, Training details, Activities, Streaks as distinct sections with optional soft background tints; one concept per section. |
| **Dashboard (Popular Costs / Stock / Sales)** | **Collapsible sections** — each section has a title, one main visual (or list), and supporting info. Muted, distinct background per section when expanded. |

---

## Prerequisites

- Phase 1 (CTL-based leveling) and Phase 2 (locker gating) can be deferred for this UI pass; the layout works with current `level` / `evolutionStage` from API.
- Ensure `getShortStateDescription()` exists in `lib/training-metrics.ts` (add if not present).

---

## Step 1: State-driven page background

**Goal:** Full-page gradient and mood driven by fatigue state (weather-app style).

**1.1 Add gradient map in `app/page.tsx` or `app/globals.css`**

Define a mapping from `FatigueState` to gradient classes or CSS variables:

```ts
// In page or a small util (e.g. lib/ui/state-theme.ts)
const STATE_GRADIENTS: Record<FatigueState, string> = {
  fresh:    'from-emerald-900/40 via-slate-900 to-teal-900/40',   // cool green
  optimal:  'from-blue-900/40 via-slate-900 to-indigo-900/40',   // blue
  trained:  'from-amber-900/30 via-slate-900 to-yellow-900/30',   // warm
  fatigued: 'from-orange-900/40 via-slate-900 to-amber-900/40',  // orange
  overtrained: 'from-red-900/40 via-slate-900 to-rose-900/40',   // red
};
```

**1.2 Apply to main wrapper**

- Replace the static `min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` on the root `<div>` with a dynamic class using `STATE_GRADIENTS[fatigueState]` (and a default when `metrics` is null, e.g. `optimal`).
- Keep the rest of the tree unchanged for this step.

**Files:** `app/page.tsx` (and optionally `lib/ui/state-theme.ts` if you extract the map).

**Verify:** Toggle state (or mock `fatigueState`) and confirm the page background changes by mood.

---

## Step 2: Slim header

**Goal:** Single-row header: [Sporty Gotchi] [Lv N] [Friends] [Locker] [Settings]. No Edit Profile / Disconnect / Achievements in the bar (move to Settings).

**2.1 Replace header markup in `app/page.tsx`**

- One row: logo/title left; Lv badge + streak (optional) next; right: Friends (disabled or placeholder), Locker (scroll to `#locker`), Settings (opens panel).
- Remove from header: "Edit Profile", "Disconnect", "Achievements", rate limit text.
- Use icon-only or icon+label for Locker and Settings (e.g. 🎒 and ⚙️) for a cleaner, lab.-style look.
- Friends: disabled with `aria-disabled="true"` and tooltip "Coming soon" (or open a placeholder panel).

**2.2 Create `components/SettingsPanel.tsx`**

- Slide-out drawer or modal.
- Contents: Edit Profile (opens existing `SetupScreen`), Disconnect Strava, View Achievements (opens existing `AchievementGrid` modal), rate limit info (if connected), app version/about.
- Controlled by state in `app/page.tsx` (e.g. `showSettings`); Settings button toggles it.

**2.3 Wire header actions in `app/page.tsx`**

- Locker button: `scrollIntoView({ block: 'start' })` on `document.getElementById('locker')`.
- Settings button: set `showSettings(true)`.
- Keep Achievement Toast and Achievement modal triggers; they can be opened from Settings instead of header.

**Files:** `app/page.tsx`, `components/SettingsPanel.tsx` (new).

**Verify:** Header is one slim row; Locker scrolls to locker; Settings opens panel with profile/disconnect/achievements.

---

## Step 3: Hero block (avatar + one-line status)

**Goal:** Single column, avatar as hero; one-line status under it (weather-app style: one big “reading” + short description).

**3.1 Replace main dashboard content (first fold)**

- Remove the 4-column grid (`lg:grid-cols-4`) and the right-hand `GamificationPanel` column from the main view.
- Add a single-column container (e.g. `max-w-lg mx-auto`) that contains:
  - **Hero:** `<SportyGotchi />` with `state`, `name`, `wearables`, `level`, `evolutionStage`. Optionally increase avatar size (e.g. `size="lg"`) for hero emphasis.
  - **One-line status:** e.g.  
    `{fatigueState} — {getShortStateDescription(fatigueState)}`  
    Use `getShortStateDescription()` from `lib/training-metrics.ts`; if missing, add it (e.g. fresh → "Ready to train hard", optimal → "Peak form — go race!", etc.).
- No metric cards, no graph, no activities list, no gamification sidebar in this hero block.

**3.2 Add `getShortStateDescription()` if missing**

In `lib/training-metrics.ts`:

```ts
export function getShortStateDescription(state: FatigueState): string {
  const descriptions: Record<FatigueState, string> = {
    fresh: 'Ready to train hard',
    optimal: 'Peak form — go race!',
    trained: 'Building fitness nicely',
    fatigued: 'Time for easier training',
    overtrained: 'Rest day needed',
  };
  return descriptions[state];
}
```

**Files:** `app/page.tsx`, `lib/training-metrics.ts`.

**Verify:** Main view shows only avatar + one-line status in a single column; no metrics/graph/activities/panel.

---

## Step 4: Locker section directly under hero

**Goal:** Locker is the next section below the hero (same single column).

**4.1 Add Locker in main column with `id="locker"`**

- Place `<Locker />` (with existing props: `currentItems`, `onItemsChange`; add `level` and `evolutionStage` when Phase 2 locker gating is implemented) inside the same `max-w-lg` container, below the hero.
- Ensure the section has `id="locker"` for the header “Locker” scroll target.

**Files:** `app/page.tsx`.

**Verify:** Scrolling or clicking Locker in header scrolls to Locker; layout stays single column.

---

## Step 5: Collapsible section component

**Goal:** Reusable accordion for secondary content (dashboard-card style, one concept per section).

**5.1 Create `components/CollapsibleSection.tsx`**

- Props: `title: string`, `icon?: string`, `defaultOpen?: boolean`, `children: React.ReactNode`.
- Renders a header row: title + optional icon + chevron (▼/▲). Click toggles open/closed.
- Use `aria-expanded` and `role="region"` for accessibility.
- Optional: subtle background tint when expanded (e.g. `bg-slate-800/60` or a state-agnostic tint) to echo the dashboard reference.
- Animate height (CSS transition or a small animation lib) for open/close.

**Files:** `components/CollapsibleSection.tsx` (new).

**Verify:** Reusable; opens/closes with chevron; accessible.

---

## Step 6: Move secondary content into collapsible sections

**Goal:** Recovery, Challenges, Training details, Recent activities, Streaks live below the Locker as collapsible sections (all collapsed by default).

**6.1 Extract `MetricCard` to `components/MetricCard.tsx`**

- Move the existing `MetricCard` helper from `app/page.tsx` into `components/MetricCard.tsx` and export it.
- Keep the same props (label, value, icon, color).

**6.2 Add collapsible sections in `app/page.tsx`**

Below the Locker, add in order:

1. **Recovery** — `<CollapsibleSection title="Recovery" defaultOpen={false}>`  
   - Content: `<RecoveryMeter />` + `<RestDayLogger />` (and “Log Rest Day” flow). Use existing `gamification.recovery` and `gamification.logRestDay`.

2. **Challenges** — `<CollapsibleSection title="Challenges" defaultOpen={false}>`  
   - Content: Daily and weekly `ChallengeCard`s; reuse existing `gamification.challenges` and `gamification.claimChallenge`.

3. **Training details** — `<CollapsibleSection title="Training details" defaultOpen={false}>`  
   - Content: Four `MetricCard`s (CTL, ATL, TSB, Total TSS) + `<TrainingGraph />`. Use existing `metrics` and `activities` / `userProfile` for graph.

4. **Recent activities** — `<CollapsibleSection title="Recent activities" defaultOpen={false}>`  
   - Content: Current list of recent activities (same markup as today, or a slim list component).

5. **Streaks** — `<CollapsibleSection title="Streaks" defaultOpen={false}>`  
   - Content: `<StreakDisplay />` with existing `gamification.stats?.streak` (and freezes if you have them).

**6.3 Remove old layout**

- Remove the old Training Metrics block, Training Graph, Recent Activities block, and the right-column GamificationPanel from the main dashboard (they’re now inside the collapsible sections above).
- Ensure the main content wrapper is a single column (e.g. `max-w-lg mx-auto space-y-8`).

**Files:** `app/page.tsx`, `components/MetricCard.tsx` (new).

**Verify:** All previous dashboard content is reachable via the five collapsible sections; default state is collapsed; no 4-column layout.

---

## Step 7: Welcome and loading states

**Goal:** Welcome (no Strava) and loading states use the same single-column, centered layout and state-driven background.

**7.1 Welcome screen**

- Keep the welcome message and Connect Strava CTA; wrap in the same `max-w-lg mx-auto` (or equivalent) and use the same root background (e.g. default to `optimal` gradient when not connected).
- Optional: use a smaller avatar on welcome for consistency.

**7.2 Loading and error states**

- Keep loading spinner and error/rate-limit UI; place in the same single-column container so layout doesn’t jump when state resolves.

**Files:** `app/page.tsx`.

**Verify:** Welcome and loading match the simplified layout and background system.

---

## Step 8: Mobile-first and viewport

**Goal:** Single column on all widths; no horizontal scroll; correct viewport.

**8.1 Layout and breakpoints**

- Use one column at all breakpoints (no `lg:grid-cols-4`). Rely on `max-w-lg mx-auto` for main content.
- Ensure header doesn’t overflow on small screens (stack or icon-only if needed).

**8.2 Viewport**

- In `app/layout.tsx`, ensure viewport meta: `width=device-width, initialScale=1` (Next.js often adds this by default; confirm).

**Files:** `app/page.tsx`, `app/layout.tsx`.

**Verify:** 375px, 768px, 1280px: single column, centered, no horizontal scroll.

---

## Step 9: Optional design polish (from references)

**9.1 Accent for primary action**

- Use a single accent color (e.g. orange) for Connect Strava and primary CTAs only, lab.-style.

**9.2 Section backgrounds**

- When a collapsible section is expanded, you can give it a very subtle tint (e.g. sage, purple-grey) to differentiate sections like the dashboard reference.

**9.3 Typography**

- Keep “Sporty Gotchi” and status line clear and high-contrast; one bold line for status (e.g. “Fresh — Ready to train hard”) so it reads like the weather description.

---

## File change summary

| Action | File |
|--------|------|
| Add | `lib/ui/state-theme.ts` (optional: state → gradient map) |
| Add | `components/SettingsPanel.tsx` |
| Add | `components/CollapsibleSection.tsx` |
| Add | `components/MetricCard.tsx` (extract from page) |
| Edit | `lib/training-metrics.ts` — add `getShortStateDescription` if missing |
| Edit | `app/page.tsx` — state background, slim header, hero + locker, collapsible sections, remove 4-col and sidebar |
| Edit | `app/layout.tsx` — viewport if needed |

---

## Verification checklist (E2E)

- [ ] Page background changes with fatigue state (or mock state).
- [ ] Header is one row: Sporty Gotchi, Lv, Friends (disabled), Locker, Settings.
- [ ] Locker button scrolls to locker section.
- [ ] Settings opens panel; Edit Profile, Disconnect, Achievements work from there.
- [ ] Main view: only avatar + one-line status + locker above the fold.
- [ ] Five collapsible sections (Recovery, Challenges, Training details, Recent activities, Streaks) open/close; content matches current app.
- [ ] No 4-column layout; no gamification sidebar on main view.
- [ ] Welcome and loading use same layout and background.
- [ ] 375px / 768px / 1280px: single column, centered, no horizontal scroll.

---

## Dependency note

- **Locker gating (Phase 2):** When you add level/evolution gating to the Locker, pass `level={gamification.stats?.level ?? 0}` and `evolutionStage={gamification.stats?.evolutionStage ?? 1}` into `<Locker />` in this same hero/locker block; no layout change required.

This guide is the executable implementation for the revised simplified UI aligned with your design references and the v3 PRD.
