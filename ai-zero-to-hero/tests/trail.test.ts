import { describe, expect, it } from 'vitest';
import { buildTrail, DASHBOARD_NODES, distanceBetween, pointAt, TEASER_NODES } from '../src/lib/trail';

describe('trail geometry', () => {
  it('passes exactly through every stop', () => {
    const trail = buildTrail(DASHBOARD_NODES);
    expect(trail.stopCount).toBe(6);
    trail.stops.forEach((s, i) => {
      const p = pointAt(trail, i);
      expect(p.x).toBeCloseTo(s.x, 0);
      expect(p.y).toBeCloseTo(s.y, 0);
    });
  });

  it('straight trails have the straight-line length', () => {
    const trail = buildTrail([{ x: 0, y: 0, stop: true }, { x: 300, y: 400, stop: true }], { straight: true });
    expect(trail.lengths[0]).toBeCloseTo(500, 3);
    const mid = pointAt(trail, 0.5);
    expect(mid.x).toBeCloseTo(150, 3);
    expect(mid.y).toBeCloseTo(200, 3);
  });

  it('curved segments are longer than the chord between stops', () => {
    const trail = buildTrail(TEASER_NODES);
    trail.stops.slice(0, -1).forEach((s, i) => {
      const chord = Math.hypot(trail.stops[i + 1].x - s.x, trail.stops[i + 1].y - s.y);
      expect(trail.lengths[i]).toBeGreaterThanOrEqual(chord - 0.5);
    });
  });

  it('a bend node is part of the segment but is not a stop', () => {
    const trail = buildTrail(DASHBOARD_NODES);
    expect(trail.d).toHaveLength(5);
    // segment 2 (stop 3 -> stop 4) goes out to the right-hand bend, so it is clearly longer than the chord
    const chord = Math.hypot(1144 - 1144, 640 - 150);
    expect(trail.lengths[2]).toBeGreaterThan(chord);
    const mid = pointAt(trail, 2.5);
    expect(mid.x).toBeGreaterThan(1200);
  });

  it('moves continuously (no jumps) as t increases', () => {
    const trail = buildTrail(DASHBOARD_NODES);
    let prev = pointAt(trail, 0);
    for (let t = 0.01; t <= 5; t += 0.01) {
      const p = pointAt(trail, t);
      expect(Math.hypot(p.x - prev.x, p.y - prev.y)).toBeLessThan(12);
      prev = p;
    }
  });

  it('clamps t outside the trail', () => {
    const trail = buildTrail(TEASER_NODES);
    expect(pointAt(trail, -3)).toEqual(pointAt(trail, 0));
    expect(pointAt(trail, 99).x).toBeCloseTo(trail.stops[5].x, 0);
  });

  it('distanceBetween adds up the segments', () => {
    const trail = buildTrail(TEASER_NODES);
    expect(distanceBetween(trail, 0, 2)).toBeCloseTo(trail.lengths[0] + trail.lengths[1], 5);
    expect(distanceBetween(trail, 2, 0)).toBeCloseTo(trail.lengths[0] + trail.lengths[1], 5);
    expect(distanceBetween(trail, 0.5, 1.5)).toBeCloseTo(0.5 * trail.lengths[0] + 0.5 * trail.lengths[1], 5);
  });

  it('a single stop trail stays put', () => {
    const trail = buildTrail([{ x: 5, y: 6, stop: true }]);
    expect(pointAt(trail, 3)).toEqual({ x: 5, y: 6 });
  });
});
