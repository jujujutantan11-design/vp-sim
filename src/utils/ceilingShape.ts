import * as THREE from "three";

/**
 * Builds a stepped/staircase-cornered rectangle shape approximating the
 * as-built ceiling LED footprint shown in the supplied plan drawing
 * (2026 review) -- the ceiling LED is NOT a plain rectangle; its
 * corners are cut in a staircase pattern (visible module-by-module
 * steps), likely to fit within the circular Main LED footprint using
 * square panel modules.
 *
 * IMPORTANT: the supplied drawing shows the STEP PATTERN visually but
 * does not give exact per-step module dimensions. The step fractions
 * below are a symmetric approximation (3 steps per corner) chosen to
 * match the drawing's proportions, NOT verified exact panel-module
 * measurements. The overall bounding width/depth (12m x 11m) remain
 * the authoritative published figures and are unaffected by this
 * approximation. Refine `CORNER_STEP_FRACTIONS` if exact per-module
 * corner dimensions become available.
 *
 * CORNER_STEP_FRACTIONS describes ONE staircase, in the first quadrant
 * (top-right), as fractions of (halfWidth, halfDepth), ordered from a
 * point on the TOP edge to a point on the RIGHT edge. x increases
 * monotonically, y decreases monotonically, alternating
 * vertical/horizontal segments to form stair steps.
 */
const CORNER_STEP_FRACTIONS: Array<[number, number]> = [
  [0.3, 1.0], // on top edge
  [0.3, 0.82],
  [0.55, 0.82],
  [0.55, 0.6],
  [0.8, 0.6],
  [0.8, 0.38],
  [1.0, 0.38], // on right edge
];

type Pt = [number, number];

function scale(points: Array<[number, number]>, hw: number, hd: number): Pt[] {
  return points.map(([fx, fy]) => [fx * hw, fy * hd]);
}

export function buildSteppedCeilingShape(width: number, depth: number): THREE.Shape {
  const hw = width / 2;
  const hd = depth / 2;

  const tr = scale(CORNER_STEP_FRACTIONS, hw, hd); // top edge -> right edge
  const trRev = [...tr].reverse();

  // Bottom-right corner: mirror TR across the x-axis (y -> -y), traversed
  // right-edge -> bottom-edge (i.e. the reverse of `tr`, y-negated).
  const br: Pt[] = trRev.map(([x, y]) => [x, -y]);

  // Bottom-left corner: mirror BR across the y-axis (x -> -x), traversed
  // bottom-edge -> left-edge (i.e. the reverse of `br`, x-negated).
  const brRev = [...br].reverse();
  const bl: Pt[] = brRev.map(([x, y]) => [-x, y]);

  // Top-left corner: mirror TR across the y-axis (x -> -x), traversed
  // left-edge -> top-edge (i.e. the reverse of `tr`, x-negated).
  const trMirroredX: Pt[] = tr.map(([x, y]) => [-x, y]);
  const tl: Pt[] = [...trMirroredX].reverse();

  // Full outline, clockwise, starting at the top edge just right of
  // center: TR corner -> (straight right edge, implicit) -> BR corner ->
  // (straight bottom edge, implicit) -> BL corner -> (straight left
  // edge, implicit) -> TL corner -> (straight top edge, implicit, closes).
  const points: Pt[] = [...tr, ...br, ...bl, ...tl];

  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1]);
  }
  shape.closePath();

  return shape;
}
