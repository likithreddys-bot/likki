/**
 * Trail geometry for the roadmap: a smooth path through stops (plus optional bend points),
 * measured in JS so the walking duck can be placed anywhere along it without touching the DOM.
 */
export type Pt = { x: number; y: number };
export type TrailNode = Pt & { stop?: boolean };

export type Trail = {
  stopCount: number;
  stops: Pt[];
  /** SVG path data for each stop-to-stop segment (segment i joins stop i and stop i+1). */
  d: string[];
  /** Pixel length of each segment. */
  lengths: number[];
  /** Sampled polyline per segment with cumulative distances (for pointAt). */
  samples: { pts: Pt[]; cum: number[] }[];
};

const SAMPLES_PER_PIECE = 48;

function cubic(p1: Pt, c1: Pt, c2: Pt, p2: Pt, u: number): Pt {
  const v = 1 - u;
  return {
    x: v * v * v * p1.x + 3 * v * v * u * c1.x + 3 * v * u * u * c2.x + u * u * u * p2.x,
    y: v * v * v * p1.y + 3 * v * v * u * c1.y + 3 * v * u * u * c2.y + u * u * u * p2.y,
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function buildTrail(nodes: TrailNode[], opts: { tension?: number; straight?: boolean } = {}): Trail {
  const tension = opts.tension ?? 1.1;
  const stopIdx = nodes.map((n, i) => (n.stop ? i : -1)).filter((i) => i >= 0);
  if (stopIdx.length === 0) throw new Error('trail needs at least one stop');

  const d: string[] = [];
  const lengths: number[] = [];
  const samples: Trail['samples'] = [];

  for (let s = 0; s < stopIdx.length - 1; s++) {
    const pts: Pt[] = [];
    let path = `M${r1(nodes[stopIdx[s]].x)} ${r1(nodes[stopIdx[s]].y)}`;
    for (let i = stopIdx[s]; i < stopIdx[s + 1]; i++) {
      const p0 = nodes[i - 1] ?? nodes[i];
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const p3 = nodes[i + 2] ?? p2;
      if (opts.straight) {
        path += ` L${r1(p2.x)} ${r1(p2.y)}`;
        for (let k = pts.length ? 1 : 0; k <= SAMPLES_PER_PIECE; k++) {
          const u = k / SAMPLES_PER_PIECE;
          pts.push({ x: p1.x + (p2.x - p1.x) * u, y: p1.y + (p2.y - p1.y) * u });
        }
      } else {
        const c1 = { x: p1.x + ((p2.x - p0.x) * tension) / 3, y: p1.y + ((p2.y - p0.y) * tension) / 3 };
        const c2 = { x: p2.x - ((p3.x - p1.x) * tension) / 3, y: p2.y - ((p3.y - p1.y) * tension) / 3 };
        path += ` C${r1(c1.x)} ${r1(c1.y)} ${r1(c2.x)} ${r1(c2.y)} ${r1(p2.x)} ${r1(p2.y)}`;
        for (let k = pts.length ? 1 : 0; k <= SAMPLES_PER_PIECE; k++) pts.push(cubic(p1, c1, c2, p2, k / SAMPLES_PER_PIECE));
      }
    }
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y));
    d.push(path);
    samples.push({ pts, cum });
    lengths.push(cum[cum.length - 1]);
  }

  return {
    stopCount: stopIdx.length,
    stops: stopIdx.map((i) => ({ x: nodes[i].x, y: nodes[i].y })),
    d,
    lengths,
    samples,
  };
}

/** Position at t in "stop space": 0 = first stop, 1 = second stop, 0.5 = halfway between them. */
export function pointAt(trail: Trail, t: number): Pt {
  const max = trail.stopCount - 1;
  if (max <= 0) return trail.stops[0];
  const tc = Math.min(Math.max(t, 0), max);
  const seg = Math.min(Math.floor(tc), max - 1);
  const dist = (tc - seg) * trail.lengths[seg];
  const { pts, cum } = trail.samples[seg];
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= dist) lo = mid;
    else hi = mid;
  }
  const span = cum[hi] - cum[lo] || 1;
  const k = (dist - cum[lo]) / span;
  return { x: pts[lo].x + (pts[hi].x - pts[lo].x) * k, y: pts[lo].y + (pts[hi].y - pts[lo].y) * k };
}

/** Length of the trail between two t values (used to pick a walking speed). */
export function distanceBetween(trail: Trail, a: number, b: number): number {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  let total = 0;
  for (let s = 0; s < trail.lengths.length; s++) {
    const from = Math.max(lo, s);
    const to = Math.min(hi, s + 1);
    if (to > from) total += (to - from) * trail.lengths[s];
  }
  return total;
}

/**
 * A snaking trail: stops fill rows left→right, then right→left, with an unnumbered bend node at the
 * edge where it turns. Works for any number of stops.
 */
function serpentine(
  n: number,
  o: { cols: number; x0: number; dx: number; y0: number; dy: number; wave: (col: number) => number; leftEdge: number; rightEdge: number },
): TrailNode[] {
  const nodes: TrailNode[] = [];
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / o.cols);
    const pos = i % o.cols;
    const col = row % 2 === 0 ? pos : o.cols - 1 - pos;
    nodes.push({ x: o.x0 + col * o.dx, y: o.y0 + row * o.dy + o.wave(col), stop: true });
    if (pos === o.cols - 1 && i < n - 1) nodes.push({ x: row % 2 === 0 ? o.rightEdge : o.leftEdge, y: o.y0 + row * o.dy + o.dy / 2 });
  }
  return nodes;
}

const rowsFor = (n: number, cols: number) => Math.max(1, Math.ceil(n / cols));

/** The desktop dashboard layout: 1344 wide, three stops per row. For six stops this is the Figma "Trail map" (1344 × 1200). */
export const dashboardNodes = (n: number): TrailNode[] =>
  serpentine(n, { cols: 3, x0: 200, dx: 472, y0: 150, dy: 490, wave: (c) => (c === 1 ? 80 : 0), leftEdge: 26, rightEdge: 1318 });
export const dashboardHeight = (n: number) => 150 + (rowsFor(n, 3) - 1) * 490 + 560;
export const DASHBOARD_NODES: TrailNode[] = dashboardNodes(6);

/** The landing-page teaser (1280 wide): one gentle wave for up to six stops, otherwise two rows. */
const teaserCols = (n: number) => (n <= 6 ? Math.max(n, 1) : Math.ceil(n / 2));
export const teaserNodes = (n: number): TrailNode[] => {
  const cols = teaserCols(n);
  return serpentine(n, { cols, x0: 100, dx: cols > 1 ? 1080 / (cols - 1) : 0, y0: 190, dy: 300, wave: (c) => (c % 2 ? -70 : 0), leftEdge: 30, rightEdge: 1250 });
};
export const teaserHeight = (n: number) => 310 + (rowsFor(n, teaserCols(n)) - 1) * 300;
export const TEASER_NODES: TrailNode[] = teaserNodes(6);
