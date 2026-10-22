'use client';
import { useEffect, useRef, useState } from 'react';
import { advanceAlong, buildGrid, findPath, isFree, nearestFree, nearestInLargestRegion, pickTarget, type Grid, type Vec } from '@/lib/roam';
import { collectObstacles } from './obstacles';
import { SittingSprite, WalkingSprite } from './sprites';

const SPEED = 46; // px/s — a slow duck waddle
const FIRST_WALK_MS = 1200; // after the page loads
const REST_MS = [2500, 5000] as const; // how long it sits between walks
const REFRESH_MS = 400; // how often it re-reads where the text is

/**
 * The page duck. It wanders around the page — but never across the text: it reads where the text,
 * buttons and inputs currently are, plans its route through the free space around them, waddles there
 * (turning to face where it is going), sits for a few seconds, then heads somewhere else. If text scrolls
 * under it, it steps out of the way; if the page leaves no free room at all, it quietly disappears until
 * some appears. It floats above the page, never blocks clicks, and under prefers-reduced-motion it just sits
 * still in a free corner.
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

    const isSmall = window.innerWidth < 640;
    const fp = isSmall ? { halfW: 28, h: 76 } : { halfW: 34, h: 100 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let grid: Grid = buildGrid(window.innerWidth, window.innerHeight, [], fp);
    let pos: Vec | null = null;
    let target: Vec | null = null;
    let path: Vec[] = [];
    let pi = 1;
    let walking = false;
    let facingNow: 1 | -1 = 1;
    let raf: number | null = null;
    let lastT = 0;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let debounce: ReturnType<typeof setTimeout> | undefined;

    const show = (v: boolean) => {
      root.style.opacity = v ? '1' : '0';
    };
    const place = () => {
      if (pos) root.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
    };
    const refresh = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      grid = buildGrid(vw, vh, collectObstacles(vw, vh), fp);
    };
    const stopWalking = () => {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      walking = false;
      setMoving(false);
    };
    const scheduleRest = (ms = REST_MS[0] + Math.random() * (REST_MS[1] - REST_MS[0])) => {
      clearTimeout(restTimer);
      restTimer = setTimeout(startWalk, ms);
    };

    const tick = (now: number) => {
      raf = null;
      if (!walking || !pos) return;
      const dt = Math.min(now - lastT, 50);
      lastT = now;
      const prevX = pos.x;
      const a = advanceAlong(path, pi, pos, dt, SPEED);
      pos = a.pos;
      pi = a.i;
      if (Math.abs(pos.x - prevX) > 0.02) {
        const f: 1 | -1 = pos.x > prevX ? 1 : -1;
        if (f !== facingNow) {
          facingNow = f;
          setFacing(f);
        }
      }
      place();
      if (a.arrived) {
        stopWalking();
        scheduleRest();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const beginWalk = (p: Vec[]) => {
      clearTimeout(restTimer);
      path = p;
      pi = 1;
      walking = true;
      setMoving(true);
      lastT = performance.now();
      if (raf === null) raf = requestAnimationFrame(tick);
    };

    /** Nowhere free on screen right now: vanish, and look again shortly. */
    const hideAndRetry = () => {
      stopWalking();
      show(false);
      scheduleRest(1500);
    };

    const placeHome = () => {
      const home = nearestInLargestRegion(grid, { x: window.innerWidth - 60, y: window.innerHeight - 10 });
      if (!home) return hideAndRetry();
      pos = home;
      place();
      show(true);
      if (!reduced) scheduleRest(FIRST_WALK_MS);
    };

    /** Text has moved onto the duck (scrolling, layout change): walk to the nearest clear spot. */
    const evict = () => {
      const free = pos && nearestFree(grid, pos);
      if (!pos || !free) return hideAndRetry();
      show(true);
      target = free;
      beginWalk([pos, free]);
    };

    function startWalk() {
      if (walking) return;
      refresh();
      if (!pos) return placeHome();
      if (!isFree(grid, pos)) return evict();
      const t = pickTarget(grid, pos, Math.random);
      const p = t ? findPath(grid, pos, t) : null;
      if (!t || !p) return scheduleRest(3500); // boxed in for now
      target = t;
      beginWalk(p);
    }

    /** Re-read the page and keep the duck (and its route) clear of the text. */
    const onRefresh = () => {
      refresh();
      if (!pos) return placeHome();
      if (!isFree(grid, pos)) {
        if (reduced) {
          const free = nearestFree(grid, pos);
          if (free) {
            pos = free;
            place();
            show(true);
          } else show(false);
          return;
        }
        return evict();
      }
      show(true);
      if (walking && target) {
        let next = findPath(grid, pos, target);
        if (!next) {
          const t = pickTarget(grid, pos, Math.random);
          next = t ? findPath(grid, pos, t) : null;
          if (next && t) target = t;
        }
        if (next) {
          path = next;
          pi = 1;
        } else {
          stopWalking();
          scheduleRest(2500);
        }
      }
    };

    const onViewportChange = () => {
      setSmall(window.innerWidth < 640);
      clearTimeout(debounce);
      debounce = setTimeout(onRefresh, 80);
    };

    refresh();
    placeHome();
    const interval = setInterval(onRefresh, REFRESH_MS);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, { passive: true, capture: true });
    return () => {
      clearInterval(interval);
      clearTimeout(restTimer);
      clearTimeout(debounce);
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, { capture: true });
    };
  }, [mounted]);

  if (!mounted) return null;
  return (
    <div
      ref={rootRef}
      aria-hidden
      data-roaming-duck
      data-pose={moving ? 'walking' : 'sitting'}
      className="pointer-events-none fixed left-0 top-0 z-30 will-change-transform transition-opacity duration-300 print:hidden"
      style={{ opacity: 0 }}
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
