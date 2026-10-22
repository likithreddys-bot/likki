/**
 * Free-roaming movement for the page duck: pick a spot somewhere across the visible content,
 * walk there at a steady (slow) speed, repeat. Pure functions so the behaviour can be unit tested.
 */
export type Vec = { x: number; y: number };
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export const clampTo = (b: Bounds, p: Vec): Vec => ({
  x: Math.min(Math.max(p.x, b.minX), b.maxX),
  y: Math.min(Math.max(p.y, b.minY), b.maxY),
});

export const distance = (a: Vec, b: Vec) => Math.hypot(b.x - a.x, b.y - a.y);

/** Moves `pos` toward `target` by `speed` px/s for `dtMs`, never overshooting. */
export function stepToward(pos: Vec, target: Vec, dtMs: number, speed: number): { pos: Vec; arrived: boolean } {
  const d = distance(pos, target);
  const step = (speed * dtMs) / 1000;
  if (d <= step || d < 1e-6) return { pos: { ...target }, arrived: true };
  const k = step / d;
  return { pos: { x: pos.x + (target.x - pos.x) * k, y: pos.y + (target.y - pos.y) * k }, arrived: false };
}

/**
 * Next place to walk to. Usually a real crossing of the page (at least ~45% of the width away,
 * on the other side of the middle); now and then a short wander. Always inside the bounds and
 * never closer than `minTrip` px, so each walk is a proper walk.
 */
export function pickWaypoint(from: Vec, b: Bounds, rand: () => number, minTrip = 220): Vec {
  const width = b.maxX - b.minX;
  const height = b.maxY - b.minY;
  const mid = b.minX + width / 2;
  let target = from;
  for (let attempt = 0; attempt < 12; attempt++) {
    const crossing = rand() < 0.75;
    let x: number;
    if (crossing) {
      const farLeft = b.minX + rand() * width * 0.3;
      const farRight = b.maxX - rand() * width * 0.3;
      x = from.x < mid ? farRight : farLeft;
    } else {
      x = from.x + (rand() - 0.5) * Math.min(width, 520);
    }
    const y = b.minY + rand() * height;
    target = clampTo(b, { x, y });
    if (distance(from, target) >= minTrip) return target;
  }
  // tiny windows: just go to the far corner
  return clampTo(b, { x: from.x < mid ? b.maxX : b.minX, y: b.minY + rand() * height });
}
