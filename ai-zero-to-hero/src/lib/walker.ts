import type { Trail } from './trail';

/**
 * Advances the walker along the trail by `speed` pixels per second.
 * `t` lives in "stop space" (see trail.pointAt). Pure, so it can be unit tested.
 */
export function stepWalker(
  trail: Trail,
  t: number,
  target: number,
  dtMs: number,
  speed: number,
): { t: number; arrived: boolean } {
  const max = trail.stopCount - 1;
  const goal = Math.min(Math.max(target, 0), max);
  if (max <= 0 || Math.abs(goal - t) < 1e-9) return { t: goal, arrived: true };

  const dir = goal > t ? 1 : -1;
  let budget = (speed * dtMs) / 1000;
  let cur = t;

  while (budget > 1e-9) {
    const seg = dir > 0 ? Math.min(Math.floor(cur + 1e-9), max - 1) : Math.max(Math.ceil(cur - 1e-9) - 1, 0);
    const len = trail.lengths[seg];
    const boundary = dir > 0 ? seg + 1 : seg;
    const reach = Math.min(Math.abs(goal - cur), Math.abs(boundary - cur));
    const px = reach * len;
    if (budget >= px) {
      cur += dir * reach;
      budget -= px;
      if (Math.abs(goal - cur) < 1e-9) return { t: goal, arrived: true };
    } else {
      cur += (dir * budget) / len;
      budget = 0;
    }
  }
  return { t: cur, arrived: false };
}
