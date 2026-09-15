# TOEI No.11st LED Volume Simulator

Virtual Production camera-planning tool for the LED Volume at TOEI TOKYO
STUDIOS, No.11 Stage.

## Status: Phase 3 — Ray/LED Coverage Engine

Adds the analytic ray/LED intersection engine and coverage sampling on
top of the verified Phase 1 + Phase 2 base (including the platform/LED
support-member correction and rendering fixes from the 2026-09-15
review):

- `src/utils/intersections.ts` — analytic ray/cylinder intersection
  against the Main LED (quadratic solve, spec §17), ray/plane
  intersection against the Ceiling LED (spec §18), and `castRay()` as
  the single entry point returning the nearest MAIN_LED / CEILING_LED /
  OUTSIDE_LED hit. Never counts intersections behind the camera, outside
  the vertical LED range, or inside the 270° arc's opening sector.
- `src/utils/coverage.ts` — samples the camera's image plane on a
  configurable grid (64×36 full quality / 32×18 while dragging, per
  spec §41), classifies each ray, computes MAIN_LED/CEILING/OUTSIDE
  percentages, frame-edge analysis (§20), and overall SAFE/WARNING/
  VIOLATION shooting status from centralized thresholds
  (`src/config/thresholds.ts`, spec §21 — never hard-coded in
  components).
- `useCoverage` hook — the single source of truth both the ANALYSIS
  panel and the CAMERA VIEW overlay read from.
- `CoverageOverlay` — OFF/STATUS/HEATMAP diagnostic overlay drawn on
  top of (not modifying) the CAMERA VIEW render, spec §19.
- ANALYSIS panel now shows live shooting status, LED/ceiling/outside
  percentages, and per-edge OK/WARNING badges.
- `tests/intersections.test.ts`, `tests/coverage.test.ts` — center
  camera, opening-direction ray, tangent/near-tangent rays, rays behind
  the camera, vertical-range misses, ceiling hits/misses, frame-edge
  detection, and shooting-status threshold tests.

**Not yet implemented**: safety zone visualization, Safe Shooting Area,
movement margin, minimum-safe-focal-length solver (Phase 4); texture
upload, floor-plan overlay, save/load (Phase 5).

---

_Prior phase notes below, kept for history._

## Status: Phase 2 — Cinema Camera

Phase 1 (geometry foundation) was verified working by the user on-device
(Codespaces + npm install/dev/tsc/test all passed). This checkout adds
Phase 2 on top of that verified base:

- `src/types/camera.ts`, `src/config/cameras/`, `src/config/lenses/` —
  Camera & Lens Database (spec §10A-10O), independent from stage config
- ARRI ALEXA 35 sensor modes populated from ARRI's own published
  technical specifications (verified: true, source recorded per entry) —
  NOT invented, NOT sourced from the TOEI facility doc
- ARRI Signature Zoom 24-75mm (TOEI_DOCUMENTED) and ARRI Signature Prime
  (focal-length list UNVERIFIED as a complete lineup; 18mm/125mm flagged
  as specifically TOEI-confirmed) — "11st常設機材のみ" filter implemented
- `src/utils/cameraMath.ts` — HFOV/VFOV/DFOV formulas, pan/tilt/roll →
  quaternion (explicit YXZ Euler order, documented to avoid ambiguity),
  and `buildSimulatedCamera` as the single source of truth for the
  simulated camera's actual `THREE.PerspectiveCamera` / projection matrix
- `useSimulatedCamera` hook — the one place FOV/camera-object logic
  lives; frustum viz, camera monitor, and (Phase 3) the coverage engine
  will all consume this same object
- `CameraFrustum` — real frustum via `THREE.CameraHelper` off the actual
  camera (not an approximated pyramid)
- `CameraView` — second Canvas rendering through the simulated camera,
  with center-cross / frame-boundary / HFOV·VFOV telemetry overlay
- `CameraTransformControls` — drei TransformControls driving an
  invisible proxy object that writes back to camera store (translate +
  rotate modes); OrbitControls (editor camera) is explicitly NEVER
  touched by this, and is disabled only while dragging to avoid input
  conflicts
- CAMERA / LENS / POSITION / ANALYSIS UI panels
- `tests/cameraMath.test.ts` — FOV formula checks against the ALEXA 35
  Open Gate sensor, monotonicity vs. focal length, quaternion sanity
  checks (pan/tilt rotate the forward vector as expected)

**Not yet implemented** (later phases): ray/LED coverage engine, safety
zone, Safe Shooting Area, texture upload, floor-plan overlay, save/load.

## ⚠️ Build not yet verified for Phase 2

Same caveat as Phase 1: written without network access in this sandbox,
so Phase 2 additions have **not been run through `tsc`/`vitest`/`vite
build`** yet. Please pull the updated files into your existing
Codespace/StackBlitz and run:

```bash
npm install   # only needed if package.json changed / first time
npx tsc -b --noEmit
npm run test
npm run build
npm run dev
```

## Things to check when you run it

1. Switching to "カメラ" (Camera) view in the top bar should show a
   rendered monitor with a center cross and HFOV/VFOV readout — not a
   placeholder message anymore.
2. Changing focal length (slider or quick buttons in the LENS panel)
   should immediately change the HFOV/VFOV numbers in the ANALYSIS
   panel and visibly change the frustum wireframe in the 3D stage view.
3. Changing Sensor Mode in the CAMERA panel should also update FOV
   immediately.
4. Dragging the on-screen gizmo (attached to the camera) in Perspective
   view should move the camera and update the numeric Position/Pan/Tilt
   fields in the CAMERA panel, and vice versa (editing the numeric
   fields should move the gizmo).
5. Orbiting the editor view (drag on empty space) should never move the
   simulated camera or its frustum.
