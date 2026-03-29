# Working Baseline (Do Not Lose)

Date recorded: 2026-03-29  
Current HEAD: `73cb02b`

## What "working" means right now
- App runs with `npm run dev` from repo root.
- App is opened through forwarded/localhost URL (not by opening `client/index.html` as a file).
- Home screen renders and shows the game card + `START GAME`.
- Clicking `START GAME` launches the Kaboom canvas and gameplay.
- App startup does not mount global toast/tooltip wrappers in `App.tsx` (prevents current `useRef` runtime overlay issue).

## Required run flow
1. `cd /workspaces/mario/Kaboom-Platformer`
2. `npm run dev`
3. Open forwarded URL (for this setup, often `http://127.0.0.1:5001` mapped to app port `5000`)

## White-screen / plugin-error guardrails
- Do not open `client/index.html` directly from the file explorer.
- Do not use Live Server for this app; use Vite/Express dev server only.
- Keep Home page high-score read guarded with `try/catch` in:
  - `client/src/pages/Home.tsx`
- Be careful with unguarded `localStorage` usage in:
  - `client/src/components/KaboomGame.tsx`
  - Runtime/plugin errors can appear if storage access throws in preview environments.
- Keep `App.tsx` minimal while stabilizing:
  - `QueryClientProvider` + `Router` only.
  - Avoid remounting `Toaster` / `TooltipProvider` until the React/Radix runtime hook issue is resolved.

## Current gameplay baseline
- Gap distances are randomized with level-based upper bounds:
  - `minGap`: 50 (L1-2), 80 (L3+)
  - `maxGap`: 250 (L1-3), 300 (L4-6), 340 (L7+) with hard cap at 360
- Mid-air assist platform spawns when `gapSize > max(170, baseSpeed * 0.45)`.
- Obstacles use fairness constraints by level band:
  - L1-4: chance `0.20`, edge buffer `150px`, min spacing `200px`, no adjacent obstacle slots
  - L5-6: chance `0.24`, edge buffer `130px`, min spacing `150px`, no adjacent slots
  - L7+: chance `0.28`, edge buffer `110px`, min spacing `110px`, adjacent slots allowed
- Assist platforms are traversal-only: no extra obstacle/treasure spawns on them.

## Safe revert workflow before major tuning
Use one of these before changing gameplay logic:

```bash
git checkout -b chore/baseline-backup-2026-03-29
git add .
git commit -m "chore: capture working baseline before gameplay tuning"
```

Or lightweight tag:

```bash
git tag working-baseline-2026-03-29
```

## Quick recovery checklist if white screen returns
1. Confirm dev server log includes `serving on port 5000`.
2. Hard refresh browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).
3. Confirm URL is forwarded server URL (not file open).
4. Check browser console for first runtime error.
5. Verify `Home.tsx` still guards high-score localStorage read.
6. If error mentions `useRef` on startup, verify `App.tsx` is not mounting toast/tooltip wrappers.
