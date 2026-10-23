import { describe, expect, it } from 'vitest';
import {
  advanceAlong,
  buildGrid,
  distance,
  findPath,
  isFree,
  lineFree,
  nearestFree,
  nearestInLargestRegion,
  pickTarget,
  reachable,
  type Footprint,
  type Rect,
  type Vec,
} from '../src/lib/roam';

const VW = 1440;
const VH = 900;
const FP: Footprint = { halfW: 34, h: 100 };

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Does the duck sprite standing with its feet at p touch any rect? */
const touches = (p: Vec, rects: Rect[], fp = FP) =>
  rects.some((o) => p.x + fp.halfW > o.l && p.x - fp.halfW < o.r && p.y > o.t && p.y - fp.h < o.b);

/** Samples a path finely and returns true if the sprite never touches an obstacle. */
function pathIsClear(path: Vec[], rects: Rect[]) {
  for (let s = 0; s < path.length - 1; s++) {
    const len = distance(path[s], path[s + 1]);
    const n = Math.max(1, Math.ceil(len / 3));
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const p = { x: path[s].x + (path[s + 1].x - path[s].x) * k, y: path[s].y + (path[s + 1].y - path[s].y) * k };
      if (touches(p, rects)) return false;
    }
  }
  return true;
}

// a reading column in the middle of the page, like the topic page's article
const column: Rect = { l: 408, t: 90, r: 1268, b: 2400 };
// a column that leaves the bottom of the window open
const shortColumn: Rect = { l: 408, t: 90, r: 1268, b: 560 };

describe('buildGrid', () => {
  it('blocks the area the sprite would overlap, but not open space', () => {
    const g = buildGrid(VW, VH, [column], FP);
    expect(isFree(g, { x: 700, y: 500 })).toBe(false); // inside the column
    expect(isFree(g, { x: 400, y: 500 })).toBe(false); // sprite would overlap the column's left edge
    expect(isFree(g, { x: 1330, y: 500 })).toBe(true); // right gutter, clear of the column
    expect(isFree(g, { x: 1000, y: 40 })).toBe(false); // sprite would leave the window at the top
    expect(isFree(g, { x: 5, y: 500 })).toBe(false); // too close to the left edge
  });

  it('keeps the whole sprite off the text (no overlap) for every free cell', () => {
    const rects: Rect[] = [column, { l: 40, t: 120, r: 330, b: 300 }, { l: 60, t: 600, r: 260, b: 640 }];
    const g = buildGrid(VW, VH, rects, FP);
    for (let cy = 0; cy < g.rows; cy++)
      for (let cx = 0; cx < g.cols; cx++) {
        const p = { x: cx * g.cell + g.cell / 2, y: cy * g.cell + g.cell / 2 };
        if (isFree(g, p)) expect(touches(p, rects)).toBe(false);
      }
  });
});

describe('findPath', () => {
  it('goes around a text column instead of across it', () => {
    const g = buildGrid(VW, VH, [shortColumn], FP);
    const from = { x: 200, y: 300 };
    const to = { x: 1350, y: 300 };
    const path = findPath(g, from, to);
    expect(path).not.toBeNull();
    expect(path![0]).toEqual(from);
    expect(path![path!.length - 1]).toEqual(to);
    expect(pathIsClear(path!, [shortColumn])).toBe(true);
    // it really detours (down below the column), so it is much longer than the straight line
    const len = path!.slice(1).reduce((s, p, i) => s + distance(path![i], p), 0);
    expect(len).toBeGreaterThan(distance(from, to) * 1.3);
    expect(Math.max(...path!.map((p) => p.y))).toBeGreaterThan(shortColumn.b);
  });

  it('walks straight when nothing is in the way', () => {
    const g = buildGrid(VW, VH, [], FP);
    expect(findPath(g, { x: 100, y: 800 }, { x: 1300, y: 300 })).toHaveLength(2);
  });

  it('finds no path across a column that spans the whole window height', () => {
    const g = buildGrid(VW, VH, [column], FP);
    expect(findPath(g, { x: 200, y: 400 }, { x: 1350, y: 400 })).toBeNull();
  });

  it('refuses to start or end inside text', () => {
    const g = buildGrid(VW, VH, [column], FP);
    expect(findPath(g, { x: 700, y: 400 }, { x: 1350, y: 400 })).toBeNull();
    expect(findPath(g, { x: 1350, y: 400 }, { x: 700, y: 400 })).toBeNull();
  });

  it('routes around many scattered obstacles without ever touching one', () => {
    const rand = seeded(11);
    const rects: Rect[] = [];
    for (let i = 0; i < 14; i++) {
      const l = 80 + rand() * 1100;
      const t = 150 + rand() * 560;
      rects.push({ l, t, r: l + 80 + rand() * 160, b: t + 20 + rand() * 60 });
    }
    const g = buildGrid(VW, VH, rects, FP);
    let checked = 0;
    for (let i = 0; i < 60; i++) {
      const a = { x: 40 + rand() * 1360, y: 110 + rand() * 780 };
      const b = { x: 40 + rand() * 1360, y: 110 + rand() * 780 };
      const path = findPath(g, a, b);
      if (!path) continue;
      expect(pathIsClear(path, rects)).toBe(true);
      checked++;
    }
    expect(checked).toBeGreaterThan(10);
  });
});

describe('pickTarget', () => {
  it('only ever picks reachable free spots, and real trips', () => {
    const g = buildGrid(VW, VH, [shortColumn], FP);
    const rand = seeded(5);
    const from = { x: 200, y: 700 };
    const seen = reachable(g, from);
    for (let i = 0; i < 200; i++) {
      const t = pickTarget(g, from, rand)!;
      expect(t).not.toBeNull();
      expect(isFree(g, t)).toBe(true);
      expect(touches(t, [shortColumn])).toBe(false);
      const cx = Math.floor(t.x / g.cell);
      const cy = Math.floor(t.y / g.cell);
      expect(seen[cy * g.cols + cx]).toBe(1);
      expect(distance(from, t)).toBeGreaterThanOrEqual(110);
    }
  });

  it('every target it picks can actually be walked to (findPath agrees with reachable)', () => {
    const rand = seeded(23);
    for (let scene = 0; scene < 12; scene++) {
      const rects: Rect[] = [];
      for (let i = 0; i < 40; i++) {
        const l = 40 + rand() * 1300;
        const t = 120 + rand() * 700;
        rects.push({ l, t, r: l + 40 + rand() * 260, b: t + 14 + rand() * 40 });
      }
      const g = buildGrid(VW, VH, rects, FP);
      const home = nearestInLargestRegion(g, { x: 1380, y: 890 });
      if (!home) continue;
      for (let k = 0; k < 25; k++) {
        const t = pickTarget(g, home, rand);
        if (!t) continue;
        expect(findPath(g, home, t), `scene ${scene}: ${JSON.stringify(home)} → ${JSON.stringify(t)}`).not.toBeNull();
      }
    }
  });

  it('stays on its own side when a full-height column cuts the window in two', () => {
    const g = buildGrid(VW, VH, [column], FP);
    const rand = seeded(2);
    for (let i = 0; i < 100; i++) {
      const t = pickTarget(g, { x: 1350, y: 500 }, rand)!;
      expect(t.x).toBeGreaterThan(column.r);
    }
  });

  it('crosses to the other side of the window when there is a way', () => {
    const g = buildGrid(VW, VH, [shortColumn], FP);
    const rand = seeded(8);
    let across = 0;
    for (let i = 0; i < 200; i++) if (pickTarget(g, { x: 150, y: 700 }, rand)!.x > VW / 2) across++;
    expect(across / 200).toBeGreaterThan(0.55);
  });

  it('returns null when the page leaves no room at all', () => {
    const g = buildGrid(VW, VH, [{ l: -10, t: -10, r: VW + 10, b: VH + 10 }], FP);
    expect(pickTarget(g, { x: 700, y: 500 }, seeded(1))).toBeNull();
    expect(nearestFree(g, { x: 700, y: 500 })).toBeNull();
  });
});

describe('nearestFree', () => {
  it('steps out of text that has scrolled under the duck', () => {
    const g = buildGrid(VW, VH, [column], FP);
    const stuck = { x: 600, y: 450 };
    expect(isFree(g, stuck)).toBe(false);
    const out = nearestFree(g, stuck)!;
    expect(isFree(g, out)).toBe(true);
    expect(touches(out, [column])).toBe(false);
  });

  it('returns the same spot if it is already free', () => {
    const g = buildGrid(VW, VH, [column], FP);
    const p = nearestFree(g, { x: 1344, y: 504 })!;
    expect(distance(p, { x: 1344, y: 504 })).toBeLessThan(g.cell);
  });
});

describe('nearestInLargestRegion', () => {
  it('skips a small walled-off pocket and picks the big open area', () => {
    // a wall of text across the bottom-right corner, with a tiny free pocket boxed in beside it
    const rects: Rect[] = [
      { l: 1100, t: 700, r: 1440, b: 720 }, // roof of the pocket
      { l: 1100, t: 700, r: 1190, b: 900 }, // left wall of the pocket
    ];
    const g = buildGrid(VW, VH, rects, { halfW: 34, h: 100 });
    const corner = { x: 1384, y: 888 };
    const pocket = nearestFree(g, corner)!;
    expect(pocket.y).toBeGreaterThan(700); // nearest free cell is inside the pocket
    const home = nearestInLargestRegion(g, corner)!;
    expect(isFree(g, home)).toBe(true);
    expect(reachable(g, home)[Math.floor(300 / g.cell) * g.cols + Math.floor(300 / g.cell)]).toBe(1); // open area is connected
  });

  it('returns null when nothing is free', () => {
    const g = buildGrid(VW, VH, [{ l: -10, t: -10, r: VW + 10, b: VH + 10 }], FP);
    expect(nearestInLargestRegion(g, { x: 700, y: 500 })).toBeNull();
  });
});

describe('advanceAlong', () => {
  const path: Vec[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];

  it('moves at the requested speed', () => {
    const r = advanceAlong(path, 1, path[0], 1000, 46);
    expect(r.arrived).toBe(false);
    expect(distance(path[0], r.pos)).toBeCloseTo(46, 6);
  });

  it('turns corners without losing distance, and stops exactly at the end', () => {
    const r = advanceAlong(path, 1, path[0], 3000, 50); // 150px: 100 along, 50 up
    expect(r.pos.x).toBeCloseTo(100, 6);
    expect(r.pos.y).toBeCloseTo(50, 6);
    expect(r.i).toBe(2);
    const end = advanceAlong(path, 2, r.pos, 10000, 50);
    expect(end).toMatchObject({ pos: { x: 100, y: 100 }, arrived: true });
  });

  it('a 16ms frame at 46px/s moves under a pixel', () => {
    expect(distance(path[0], advanceAlong(path, 1, path[0], 16, 46).pos)).toBeLessThan(1);
  });
});

describe('lineFree', () => {
  it('detects when a straight line would cross text', () => {
    const g = buildGrid(VW, VH, [shortColumn], FP);
    expect(lineFree(g, { x: 150, y: 300 }, { x: 1350, y: 300 })).toBe(false);
    expect(lineFree(g, { x: 150, y: 750 }, { x: 1350, y: 750 })).toBe(true);
  });
});
