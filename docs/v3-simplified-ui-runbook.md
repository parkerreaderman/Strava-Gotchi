# v3 Simplified UI — Agent Runbook (Cursor)

Use this runbook to execute the v3 simplified UI plan effectively in Cursor with agents, rules, and skills.

---

## Cursor assets

| Asset | Path | Purpose |
|-------|------|---------|
| **Rule** | `.cursor/rules/v3-simplified-ui.mdc` | Injects v3 UI context (design principles, key files) when working on page, SettingsPanel, CollapsibleSection, MetricCard, Locker, SportyGotchi, training-metrics, state-theme. |
| **Skill** | `.cursor/skills/v3-simplified-ui/SKILL.md` | Step-by-step executor for the simplified UI. Invoke with `@v3-simplified-ui` or by name when running an agent. |
| **Spec** | `docs/v3-simplified-ui-implementation-guide.md` | Full implementation guide (design references, code snippets, verification). |

---

## How to run

### Option A — Single agent (full run)

Best when you want one Composer session to do the whole plan.

1. **Open** `app/page.tsx` (so the v3 rule can apply if globs match).
2. **Start Agent (Composer)** and use this prompt:

```
Implement the v3 simplified UI using @v3-simplified-ui. Follow the skill steps in order. Full spec is in docs/v3-simplified-ui-implementation-guide.md. After each step, verify before moving on. Do not skip the CollapsibleSection or SettingsPanel; create new components as specified.
```

3. If the skill is not found by name, say: "Use the skill in .cursor/skills/v3-simplified-ui/SKILL.md and follow its steps in order."

---

### Option B — Phased agents (4 sub-runs)

Use when you want to run smaller, reviewable chunks or split work across sessions. Each phase is one Agent run. Complete phases in order.

---

#### Phase 1 — Theme & header (Steps 1–2)

**Scope**: State-driven background, slim header, SettingsPanel.

**Before starting**: Open `app/page.tsx` and (optionally) `lib/training-metrics.ts`.

**Prompt**:

```
Follow @v3-simplified-ui Steps 1 and 2 only.

Step 1: Add state-driven page background (STATE_GRADIENTS by fatigue state on root div). Step 2: Replace header with slim row [Sporty Gotchi] [Lv] [Friends disabled] [Locker] [Settings], create components/SettingsPanel.tsx with Edit Profile, Disconnect, Achievements, rate limit, version; wire Locker to scroll to #locker and Settings to open panel. Do not change the main dashboard content yet. Spec: docs/v3-simplified-ui-implementation-guide.md.
```

**Verify**: Background changes with state; header is one row; Locker scrolls; Settings opens panel with all actions.

**Files touched**: `app/page.tsx`, `components/SettingsPanel.tsx`, optionally `lib/ui/state-theme.ts`.

---

#### Phase 2 — Hero & locker (Steps 3–4)

**Scope**: Hero block (avatar + one-line status), Locker placement, getShortStateDescription.

**Before starting**: Open `app/page.tsx`, `lib/training-metrics.ts`.

**Prompt**:

```
Follow @v3-simplified-ui Steps 3 and 4 only.

Step 3: Add getShortStateDescription in lib/training-metrics.ts. Replace main dashboard with single-column max-w-lg: hero (SportyGotchi + one-line status only), no 4-column grid, no metrics/graph/activities/panel in hero. Step 4: Place Locker below hero with id="locker". Do not add collapsible sections yet. Spec: docs/v3-simplified-ui-implementation-guide.md.
```

**Verify**: Main view = avatar + one line of status + Locker; single column; no sidebar or metric cards in main view.

**Files touched**: `lib/training-metrics.ts`, `app/page.tsx`.

---

#### Phase 3 — Collapsible sections (Steps 5–6)

**Scope**: CollapsibleSection component, MetricCard extract, move all secondary content into five collapsible sections.

**Before starting**: Open `app/page.tsx`, `components/GamificationPanel.tsx` (for reference to RecoveryMeter, RestDayLogger, ChallengeCard, StreakDisplay).

**Prompt**:

```
Follow @v3-simplified-ui Steps 5 and 6 only.

Step 5: Create components/CollapsibleSection.tsx (title, icon?, defaultOpen?, children; aria-expanded, role="region"). Step 6: Extract MetricCard to components/MetricCard.tsx. Add five CollapsibleSections below Locker (all defaultOpen false): Recovery (RecoveryMeter + RestDayLogger), Challenges (daily/weekly ChallengeCards), Training details (MetricCards CTL/ATL/TSB/TSS + TrainingGraph), Recent activities (current list), Streaks (StreakDisplay). Remove the old Training Metrics block, Training Graph block, Recent Activities block, and the right-column GamificationPanel from the page. Spec: docs/v3-simplified-ui-implementation-guide.md.
```

**Verify**: All previous dashboard content is inside the five sections; sections collapse/expand; single column; no duplicate content.

**Files touched**: `components/CollapsibleSection.tsx`, `components/MetricCard.tsx`, `app/page.tsx`.

---

#### Phase 4 — Polish (Steps 7–8)

**Scope**: Welcome/loading consistency, mobile-first, viewport.

**Before starting**: Open `app/page.tsx`, `app/layout.tsx`.

**Prompt**:

```
Follow @v3-simplified-ui Steps 7 and 8 only.

Step 7: Ensure welcome and loading/error states use the same max-w-lg container and state-driven background. Step 8: Confirm single column at all breakpoints, no horizontal scroll; ensure app/layout.tsx has viewport width=device-width initialScale=1. Spec: docs/v3-simplified-ui-implementation-guide.md.
```

**Verify**: 375px, 768px, 1280px — single column, centered, no horizontal scroll; welcome/loading match layout and background.

**Files touched**: `app/page.tsx`, `app/layout.tsx`.

---

## Skill invocation in Cursor

- **By name**: In Composer, type `@` and select the skill (e.g. "v3-simplified-ui") if it appears in the skill list.
- **By reference**: If the skill does not appear, say "Follow the instructions in .cursor/skills/v3-simplified-ui/SKILL.md" and attach or paste the runbook phase prompt.
- **Rule activation**: The rule `v3-simplified-ui.mdc` applies when any of its globs are open (e.g. `app/page.tsx`, `components/SettingsPanel.tsx`). Open one of those files when starting an agent run so the rule is in context.

---

## Final verification checklist

After all phases (or full run):

- [ ] Page background changes with fatigue state.
- [ ] Header: one row with Sporty Gotchi, Lv, Friends (disabled), Locker, Settings.
- [ ] Locker button scrolls to locker; Settings opens panel (Edit Profile, Disconnect, Achievements, rate limit).
- [ ] Main view: only avatar + one-line status + Locker above the fold.
- [ ] Five collapsible sections (Recovery, Challenges, Training details, Recent activities, Streaks); content matches current app; default collapsed.
- [ ] No 4-column layout; no gamification sidebar on main view.
- [ ] Welcome and loading use same layout and background.
- [ ] 375px / 768px / 1280px: single column, centered, no horizontal scroll.

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| Rule not applied | Open a file matching the rule glob (e.g. `app/page.tsx`) before or at start of the agent run. |
| Skill not found | Refer explicitly to `.cursor/skills/v3-simplified-ui/SKILL.md` and paste the relevant step list. |
| Agent changes too much | Use phased runs (Option B) and restrict the prompt to "Steps X and Y only." |
| Verification fails | Re-open the spec (docs/v3-simplified-ui-implementation-guide.md) and the skill; re-run the step with the verification criteria in the prompt. |
