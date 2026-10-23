/**
 * Where the page duck may walk. The viewport is turned into a grid of cells; every cell where the duck's
 * whole body would touch text (or leave the window) is blocked. Paths are planned only through free cells,
 * so the duck walks around the readable content instead of across it. Pure functions — unit tested.
 *
 * Positions are the duck's FEET (bottom centre) in viewport pixels. The sprite occupies
 * [x - halfW, x + halfW] × [y - h, y].
 */
export type Vec = { x: number; y: number };
export type Rect = { l: number; t: number; r: number; b: number };
export type Footprint = { halfW: number; h: number };
export type Grid = { cell: number; cols: number; rows: number; width: number; height: number; blocked: Uint8Array };

export const distance = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);

// ───────────────────────────── grid ─────────────────────────────

/**
 * A feet position is blocked when the sprite (plus `margin`) would overlap any obstacle,
 * or poke outside the window (kept `edge` px inside it).
 */
export function buildGrid(
  vw: number,
  vh: number,
  obstacles: Rect[],
  fp: Footprint,
  opts: { cell?: number; margin?: number; edge?: number } = {},
): Grid {
  const cell = opts.cell ?? 16;
  const margin = opts.margin ?? 10;
  const edge = opts.edge ?? 6;
  const cols = Math.max(1, Math.ceil(vw / cell));
  const rows = Math.max(1, Math.ceil(vh / cell));
  const blocked = new Uint8Array(cols * rows);

  for (let cy = 0; cy < rows; cy++) {
    const y = cy * cell + cell / 2;
    for (let cx = 0; cx < cols; cx++) {
      const x = cx * cell + cell / 2;
      if (x < fp.halfW + edge || x > vw - fp.halfW - edge || y < fp.h + edge || y > vh - edge) blocked[cy * cols + cx] = 1;
    }
  }

  for (const o of obstacles) {
    // Minkowski sum of the obstacle with the sprite: the feet may not be inside this expanded box.
    const l = o.l - fp.halfW - margin;
    const r = o.r + fp.halfW + margin;
    const t = o.t - margin;
    const b = o.b + fp.h + margin;
    const c0 = Math.max(0, Math.floor(l / cell));
    const c1 = Math.min(cols - 1, Math.floor(r / cell));
    const r0 = Math.max(0, Math.floor(t / cell));
    const r1 = Math.min(rows - 1, Math.floor(b / cell));
    for (let cy = r0; cy <= r1; cy++) {
      const y = cy * cell + cell / 2;
      if (y <= t || y >= b) continue;
      for (let cx = c0; cx <= c1; cx++) {
        const x = cx * cell + cell / 2;
        if (x > l && x < r) blocked[cy * cols + cx] = 1;
      }
    }
  }
  return { cell, cols, rows, width: vw, height: vh, blocked };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
export const cellOf = (g: Grid, p: Vec) => ({
  cx: clamp(Math.floor(p.x / g.cell), 0, g.cols - 1),
  cy: clamp(Math.floor(p.y / g.cell), 0, g.rows - 1),
});
export const centerOf = (g: Grid, cx: number, cy: number): Vec => ({ x: cx * g.cell + g.cell / 2, y: cy * g.cell + g.cell / 2 });
export const isFree = (g: Grid, p: Vec) => {
  if (p.x < 0 || p.y < 0 || p.x > g.width || p.y > g.height) return false;
  const { cx, cy } = cellOf(g, p);
  return g.blocked[cy * g.cols + cx] === 0;
};

/** True if the straight segment a→b stays in free cells. */
export function lineFree(g: Grid, a: Vec, b: Vec): boolean {
  const len = distance(a, b);
  const steps = Math.max(1, Math.ceil(len / (g.cell / 4)));
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    if (!isFree(g, { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k })) return false;
  }
  return true;
}

const DIRS: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

function neighbours(g: Grid, cx: number, cy: number, fn: (nx: number, ny: number, cost: number) => void) {
  for (const [dx, dy, cost] of DIRS) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx < 0 || ny < 0 || nx >= g.cols || ny >= g.rows || g.blocked[ny * g.cols + nx]) continue;
    // no cutting the corner of a blocked cell
    if (dx !== 0 && dy !== 0 && (g.blocked[cy * g.cols + nx] || g.blocked[ny * g.cols + cx])) continue;
    fn(nx, ny, cost);
  }
}

/** Which cells can be walked to from `from` (8-neighbour flood fill). Empty if `from` is itself blocked. */
export function reachable(g: Grid, from: Vec): Uint8Array {
  const seen = new Uint8Array(g.cols * g.rows);
  const { cx, cy } = cellOf(g, from);
  if (g.blocked[cy * g.cols + cx]) return seen;
  const queue = [cy * g.cols + cx];
  seen[queue[0]] = 1;
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head];
    neighbours(g, i % g.cols, Math.floor(i / g.cols), (nx, ny) => {
      const j = ny * g.cols + nx;
      if (!seen[j]) {
        seen[j] = 1;
        queue.push(j);
      }
    });
  }
  return seen;
}

// ───────────────────────────── A* ─────────────────────────────

class MinHeap {
  private items: { i: number; f: number }[] = [];
  get size() {
    return this.items.length;
  }
  push(i: number, f: number) {
    const a = this.items;
    a.push({ i, f });
    let k = a.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (a[p].f <= a[k].f) break;
      [a[p], a[k]] = [a[k], a[p]];
      k = p;
    }
  }
  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < a.length && a[l].f < a[m].f) m = l;
        if (r < a.length && a[r].f < a[m].f) m = r;
        if (m === k) break;
        [a[m], a[k]] = [a[k], a[m]];
        k = m;
      }
    }
    return top;
  }
}

/**
 * Shortest path from → to through free cells, pulled straight wherever there is a clear line.
 * Returns the waypoints (starting with `from`, ending at `to`), or null if there is no way.
 */
export function findPath(g: Grid, from: Vec, to: Vec): Vec[] | null {
  const s = cellOf(g, from);
  const t = cellOf(g, to);
  const si = s.cy * g.cols + s.cx;
  const ti = t.cy * g.cols + t.cx;
  if (g.blocked[si] || g.blocked[ti]) return null;
  if (si === ti || lineFree(g, from, to)) return [from, to];

  const n = g.cols * g.rows;
  const gScore = new Float64Array(n).fill(Infinity); // 64-bit: the stale-entry check below compares against full-precision f values
  const came = new Int32Array(n).fill(-1);
  const h = (cx: number, cy: number) => {
    const dx = Math.abs(cx - t.cx);
    const dy = Math.abs(cy - t.cy);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };
  const open = new MinHeap();
  gScore[si] = 0;
  open.push(si, h(s.cx, s.cy));
  let found = false;
  while (open.size) {
    const { i, f } = open.pop();
    const cx = i % g.cols;
    const cy = Math.floor(i / g.cols);
    if (f > gScore[i] + h(cx, cy) + 1e-6) continue; // stale entry
    if (i === ti) {
      found = true;
      break;
    }
    neighbours(g, cx, cy, (nx, ny, cost) => {
      const j = ny * g.cols + nx;
      const ng = gScore[i] + cost;
      if (ng < gScore[j]) {
        gScore[j] = ng;
        came[j] = i;
        open.push(j, ng + h(nx, ny));
      }
    });
  }
  if (!found) return null;

  const cells: Vec[] = [];
  for (let i = ti; i !== -1; i = came[i]) cells.push(centerOf(g, i % g.cols, Math.floor(i / g.cols)));
  cells.reverse();
  const pts = [from, ...cells.slice(1, -1), to];

  // string pulling: keep only the corners we actually need
  const out = [pts[0]];
  let a = 0;
  while (a < pts.length - 1) {
    let b = pts.length - 1;
    while (b > a + 1 && !lineFree(g, pts[a], pts[b])) b--;
    out.push(pts[b]);
    a = b;
  }
  return out;
}

/** The free spot nearest to `p` (used to step out of the way when text scrolls under the duck). */
export function nearestFree(g: Grid, p: Vec): Vec | null {
  const { cx, cy } = cellOf(g, p);
  const maxR = Math.max(g.cols, g.rows);
  let best: Vec | null = null;
  let bestD = Infinity;
  for (let r = 0; r <= maxR; r++) {
    if (best && r * g.cell > bestD + g.cell) break;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= g.cols || y >= g.rows || g.blocked[y * g.cols + x]) continue;
        const c = centerOf(g, x, y);
        const d = distance(p, c);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
    }
  }
  return best;
}

/**
 * The free spot nearest to `p` that lies in the biggest connected area of free space — so the duck
 * never starts out stuck in a small pocket between bits of text. Null if nothing is free.
 */
export function nearestInLargestRegion(g: Grid, p: Vec): Vec | null {
  const label = new Int32Array(g.cols * g.rows).fill(-1);
  const sizes: number[] = [];
  for (let start = 0; start < label.length; start++) {
    if (g.blocked[start] || label[start] !== -1) continue;
    const id = sizes.length;
    let size = 0;
    const queue = [start];
    label[start] = id;
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head];
      size++;
      neighbours(g, i % g.cols, Math.floor(i / g.cols), (nx, ny) => {
        const j = ny * g.cols + nx;
        if (label[j] === -1) {
          label[j] = id;
          queue.push(j);
        }
      });
    }
    sizes.push(size);
  }
  if (!sizes.length) return null;
  const biggest = sizes.indexOf(Math.max(...sizes));
  let best: Vec | null = null;
  let bestD = Infinity;
  for (let i = 0; i < label.length; i++) {
    if (label[i] !== biggest) continue;
    const c = centerOf(g, i % g.cols, Math.floor(i / g.cols));
    const d = distance(p, c);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

/**
 * Somewhere worth walking to: a free cell the duck can actually reach, a proper trip away.
 * Usually on the far side of the window (so it crosses what free space there is), sometimes just a wander.
 */
export function pickTarget(g: Grid, from: Vec, rand: () => number, minTrip = 240): Vec | null {
  const seen = reachable(g, from);
  const mid = g.width / 2;
  const far: Vec[] = [];
  for (let cy = 0; cy < g.rows; cy += 2) {
    for (let cx = 0; cx < g.cols; cx += 2) {
      if (!seen[cy * g.cols + cx]) continue;
      const c = centerOf(g, cx, cy);
      if (distance(from, c) >= minTrip) far.push(c);
    }
  }
  if (!far.length) return minTrip > 110 ? pickTarget(g, from, rand, 110) : null;
  const across = far.filter((c) => c.x < mid !== from.x < mid);
  const pool = across.length && rand() < 0.75 ? across : far;
  return pool[Math.floor(rand() * pool.length)];
}

// ───────────────────────────── walking ─────────────────────────────

/** Advance along `path` (next waypoint = path[i]) by `speed` px/s for `dtMs`. */
export function advanceAlong(path: Vec[], i: number, pos: Vec, dtMs: number, speed: number): { pos: Vec; i: number; arrived: boolean } {
  let budget = (speed * dtMs) / 1000;
  let p = pos;
  let idx = i;
  while (idx < path.length && budget > 1e-9) {
    const d = distance(p, path[idx]);
    if (d <= budget) {
      p = path[idx];
      budget -= d;
      idx++;
    } else {
      const k = budget / d;
      p = { x: p.x + (path[idx].x - p.x) * k, y: p.y + (path[idx].y - p.y) * k };
      budget = 0;
    }
  }
  return { pos: p, i: idx, arrived: idx >= path.length };
}
