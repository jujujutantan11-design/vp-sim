# TOEI No.11st LED Volume Simulator

Virtual Production camera-planning tool for the LED Volume at TOEI TOKYO
STUDIOS, No.11 Stage.

## Status: Phase 1 — Geometry Foundation

This checkout implements **only** Phase 1 per the incremental build
process:

- React + TypeScript + Vite + Three.js / React Three Fiber / drei +
  Zustand + Tailwind project skeleton
- `TOEI_NO11` stage preset (config/stages/toeiNo11.ts) holding all
  supplied facility figures verbatim, including both the published
  nominal diameter (~12.0 m) and the drawing-reference diameter
  (12.636 m) as distinct, non-reconciled values
- Mathematically defined 270° Main LED cylindrical surface
  (deliberate BufferGeometry, not a generic decorative cylinder),
  parameterized as `x = R sin(theta)`, `z = R cos(theta)`, matching
  `src/utils/coordinates.ts` exactly so Phase 3's ray/LED intersection
  math can reuse the same convention
- Rectangular, downward-facing Ceiling LED
- Platform slab, coordinate axes with opening-direction label
- Editor camera + OrbitControls with Perspective / Top / Front / Side
  view switching (Camera view is stubbed — arrives Phase 2)
- Stage Diagnostics panel surfacing (not hiding) the arc-length vs.
  published-wall-width discrepancy and the two diameter sources
- Unit tests for the arc-angle/opening-direction math and the
  diagnostics calculations

**Not yet implemented** (by design — later phases per the spec):
simulated cinema camera, FOV/frustum, camera monitor, ray/LED coverage
engine, safety-zone visualization, Safe Shooting Area, texture upload,
floor-plan overlay, project save/load.

## ⚠️ Important — build not yet verified in this environment

This code was written in a sandboxed container **without internet
access**, so `npm install` could not be run here and `tsc` / `vitest` /
`vite build` have **not actually been executed** against it. Please run
the verification steps below on your machine and report back anything
that fails — I'll fix it before we move to Phase 2.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

## Verify

```bash
npx tsc -b --noEmit   # type-check
npm run test          # vitest
npm run build          # production build
```

## Things to check when you run it

1. The Main LED wall should read as a 270° arc with a clear ~90° gap
   facing +Z (toward the default camera in Perspective view).
2. Diagnostics panel (right side) should show a calculated arc length
   of ~29.77 m against the published 30.0 m wall width — this
   discrepancy is intentional, not a bug.
3. Top / Front / Side / Perspective view buttons should each reposition
   the editor camera correctly.
4. Ceiling LED should appear as a flat panel above the stage, facing
   downward, toggleable in the left panel.
