---
name: v3-simplified-ui
description: Implements Sporty Gotchi v3 simplified UI: state-driven background, slim header, hero + locker, collapsible sections. Use when the user asks to implement the v3 simplified UI, run the v3 UI plan, or execute steps from docs/v3-simplified-ui-implementation-guide.md.
---

# v3 Simplified UI — Executor Skill

Execute steps in order. After each step, run verification before proceeding. Full spec: [docs/v3-simplified-ui-implementation-guide.md](../../docs/v3-simplified-ui-implementation-guide.md).

## When to use

- User says "implement v3 simplified UI", "run v3 UI plan", "execute the simplified UI guide".
- User references @v3-simplified-ui or the implementation guide.

## Execution order

### Step 1 — State-driven page background

- Add `STATE_GRADIENTS: Record<FatigueState, string>` (e.g. in `app/page.tsx` or `lib/ui/state-theme.ts`). Map: fresh→emerald/teal, optimal→blue/indigo, trained→amber/yellow, fatigued→orange/amber, overtrained→red/rose (use Tailwind gradient classes).
- On root `<div>`, replace static gradient with dynamic class from `STATE_GRADIENTS[fatigueState ?? 'optimal']`.
- **Verify**: Background changes when fatigue state changes (or mock state).

### Step 2 — Slim header + SettingsPanel

- Replace header with one row: title, Lv badge (+ optional streak), then Friends (disabled, "Coming soon"), Locker (scroll to #locker), Settings (opens panel). Remove Edit Profile, Disconnect, Achievements, rate limit from header.
- Create `components/SettingsPanel.tsx`: drawer/modal with Edit Profile (→ SetupScreen), Disconnect, View Achievements (→ AchievementGrid), rate limit info, app version. Controlled by `showSettings` state in page.
- Wire: Locker button → `document.getElementById('locker')?.scrollIntoView({ block: 'start' })`; Settings button → `setShowSettings(true)`.
- **Verify**: Header slim; Locker scrolls; Settings opens panel with all actions.

### Step 3 — Hero block + getShortStateDescription

- Add `getShortStateDescription(state: FatigueState): string` in `lib/training-metrics.ts` (fresh→"Ready to train hard", optimal→"Peak form — go race!", trained→"Building fitness nicely", fatigued→"Time for easier training", overtrained→"Rest day needed").
- Remove 4-column grid and right-hand GamificationPanel from main dashboard. Add single-column container `max-w-lg mx-auto`: (1) SportyGotchi (state, name, wearables, level, evolutionStage; optional `size="lg"`), (2) one line: `{fatigueState} — {getShortStateDescription(fatigueState)}`. No metrics, graph, activities, or panel in hero.
- **Verify**: Main view = avatar + one-line status only; single column.

### Step 4 — Locker under hero

- Place Locker in same `max-w-lg` container below hero; ensure wrapper has `id="locker"`.
- **Verify**: Locker visible below hero; header Locker button scrolls to it.

### Step 5 — CollapsibleSection component

- Create `components/CollapsibleSection.tsx`: props `title`, `icon?`, `defaultOpen?`, `children`. Header with title + chevron; toggle open/close; `aria-expanded`, `role="region"`; optional height transition.
- **Verify**: Component toggles; accessible.

### Step 6 — Secondary content in collapsible sections

- Extract `MetricCard` from `app/page.tsx` to `components/MetricCard.tsx` (same props).
- Below Locker, add five CollapsibleSections (all `defaultOpen={false}`):
  1. **Recovery** — RecoveryMeter + RestDayLogger (use gamification.recovery, gamification.logRestDay).
  2. **Challenges** — Daily/weekly ChallengeCards (gamification.challenges, gamification.claimChallenge).
  3. **Training details** — Four MetricCards (CTL, ATL, TSB, Total TSS) + TrainingGraph.
  4. **Recent activities** — Existing activities list.
  5. **Streaks** — StreakDisplay (gamification.stats?.streak).
- Remove old Training Metrics block, Training Graph block, Recent Activities block, and right-column GamificationPanel from dashboard.
- **Verify**: All prior content reachable via sections; default collapsed; single column only.

### Step 7 — Welcome & loading

- Welcome and loading/error states: same `max-w-lg` container and state-driven background (default gradient when no metrics).
- **Verify**: No layout jump; consistent background.

### Step 8 — Mobile & viewport

- Ensure single column at all breakpoints; no horizontal scroll. Confirm viewport in `app/layout.tsx` (width=device-width, initialScale=1).
- **Verify**: 375px, 768px, 1280px — single column, centered.

## Checklist (copy per run)

```
- [ ] Step 1: State background
- [ ] Step 2: Slim header + SettingsPanel
- [ ] Step 3: Hero + getShortStateDescription
- [ ] Step 4: Locker under hero
- [ ] Step 5: CollapsibleSection
- [ ] Step 6: Five collapsible sections + MetricCard extract
- [ ] Step 7: Welcome/loading
- [ ] Step 8: Mobile/viewport
```

## File touch list

- **New**: `lib/ui/state-theme.ts` (optional), `components/SettingsPanel.tsx`, `components/CollapsibleSection.tsx`, `components/MetricCard.tsx`
- **Edit**: `lib/training-metrics.ts`, `app/page.tsx`, `app/layout.tsx` (if viewport missing)
