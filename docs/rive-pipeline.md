## Rive Animation Pipeline

**Status:** The production app uses **pixel** components (`components/pixel/`), not the Rive runtime. There is **no** `rive` or `@rive-app/react` npm dependency. This doc is for a **future** art pipeline if you switch to `.riv` assets.

### Files to Produce
| Avatar State | TSB Range | File Name | Notes |
| --- | --- | --- | --- |
| Fresh | TSB > 25 | `gotchi_fresh.riv` | High-energy bounce + bright blue palette. |
| Optimal | 5 ≤ TSB ≤ 25 | `gotchi_optimal.riv` | Calm breathing loop, default green palette. |
| Fatigued | -30 ≤ TSB < -10 | `gotchi_fatigued.riv` | Slower sway, orange palette, subtle sweat. |
| Overtrained | TSB < -30 | `gotchi_overtrained.riv` | Drooped posture, red palette, X eyes blink. |

All artboards should be 1080×1080 with responsive bones so engineering can scale for hero (desktop) and card (mobile) placements without distortion.

### Artboard & State Machine Contract
```
Artboard: SportyGotchi
State Machine: MoodMachine
Inputs:
  - trigger celebrate (optional confetti)
  - number energy (0–100 default 50)
```
Engineers will swap entire `.riv` files per state, but consistent naming keeps downstream automation simple.

### Export Process
1. Build animations in the shared Rive workspace folder (`Rive_character_animation_course/` for drafts).
2. Export final `.riv` files into `public/rive/`.
3. Export a static thumbnail (`.png`) for each state into `public/rive/previews/`.
4. Update this document with version numbers when assets change.

### Handoff Checklist
- Include a short Loom/GIF demonstrating each state transition.
- Deliver color tokens (primary, secondary, accent) in hex.
- Note any animation inputs or interactions beyond the default loop.

### Tooling Tips
- Use nested artboards for accessories so we can swap hats/shirts later.
- Drive timing from a single timeline so the animation length is 3s and loops cleanly.
- Keep file size under 500KB per `.riv`.

