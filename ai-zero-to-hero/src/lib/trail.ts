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

/** The desktop dashboard layout (1344 × 1200), matching the Figma "Trail map" frame. */
export const DASHBOARD_NODES: TrailNode[] = [
  { x: 200, y: 150, stop: true },
  { x: 672, y: 230, stop: true },
  { x: 1144, y: 150, stop: true },
  { x: 1318, y: 395 }, // bend on the right edge, not a stop
  { x: 1144, y: 640, stop: true },
  { x: 672, y: 720, stop: true },
  { x: 200, y: 640, stop: true },
];

/** The landing-page teaser: six stops on a gentle wave (1280 × 260), matching the Figma "Trail map". */
export const TEASER_NODES: TrailNode[] = [0, 1, 2, 3, 4, 5].map((i) => ({
  x: 100 + i * 216,
  y: i % 2 ? 120 : 190,
  stop: true,
}));
