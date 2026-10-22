'use client';
import { useEffect, useRef, useState } from 'react';
import { pickWaypoint, clampTo, stepToward, type Bounds, type Vec } from '@/lib/roam';
import { SittingSprite, WalkingSprite } from './sprites';

const SPEED = 46; // px/s — a slow duck waddle
const FIRST_WALK_MS = 1200; // after the page loads
const REST_MS = [2500, 5000] as const; // how long it sits between walks

/**
 * The page duck. It wanders across the visible content on every page: picks a spot, waddles there
 * (turning to face where it is going), sits for a few seconds, then heads somewhere else — usually
 * across to the other side of the page. It floats above the page, never blocks clicks, and under
 * prefers-reduced-motion it just sits in the bottom-right corner.
 */
export function RoamingDuck() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [moving, setMoving] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    setSmall(window.innerWidth < 640);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    if (!root) return;

    const bounds = (): Bounds => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      return { minX: 50, maxX: Math.max(120, w - 50), minY: Math.min(165, h * 0.45), maxY: Math.max(160, h - 12) };
    };
    const place = (p: Vec) => {
      root.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const b = bounds();
      place({ x: b.maxX - 10, y: b.maxY });
      return;
    }

    let pos: Vec = { x: bounds().minX + 10, y: bounds().maxY };
    let target: Vec = pos;
    let facingNow: 1 | -1 = 1;
    let raf: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = 0;
    place(pos);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const prevX = pos.x;
      const step = stepToward(pos, target, dt, SPEED);
      pos = step.pos;
      if (Math.abs(pos.x - prevX) > 0.02) {
        const f: 1 | -1 = pos.x > prevX ? 1 : -1;
        if (f !== facingNow) {
          facingNow = f;
          setFacing(f);
        }
      }
      place(pos);
      if (step.arrived) {
        raf = null;
        setMoving(false);
        timer = setTimeout(startWalk, REST_MS[0] + Math.random() * (REST_MS[1] - REST_MS[0]));
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const startWalk = () => {
      target = pickWaypoint(pos, bounds(), Math.random);
      setMoving(true);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const b = bounds();
      pos = clampTo(b, pos);
      target = clampTo(b, target);
      place(pos);
      setSmall(window.innerWidth < 640);
    };

    timer = setTimeout(startWalk, FIRST_WALK_MS);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [mounted]);

  if (!mounted) return null;
  return (
    <div
      ref={rootRef}
      aria-hidden
      data-roaming-duck
      data-pose={moving ? 'walking' : 'sitting'}
      className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform print:hidden"
    >
      <div style={{ transform: 'translate(-50%, -100%)' }}>
        {moving ? (
          <WalkingSprite height={small ? 64 : 84} flip={facing < 0} />
        ) : (
          <SittingSprite height={small ? 72 : 96} flip={facing < 0} />
        )}
      </div>
    </div>
  );
}
