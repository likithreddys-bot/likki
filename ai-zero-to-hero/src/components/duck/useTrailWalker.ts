'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { distanceBetween, pointAt, type Trail } from '@/lib/trail';
import { stepWalker } from '@/lib/walker';

type Options = {
  /** Which stop the duck is sitting on at first render. */
  initialStop?: number;
  /** Walking speed in px/s — deliberately slow, like a duck. */
  speed?: number;
  /** Used when the trip is long, so the duck does not take minutes to cross the map. */
  fastSpeed?: number;
  onArrive?: (stop: number) => void;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Drives a duck along a Trail. Position is written straight to the element's transform each frame
 * (no React re-render); React only hears about `moving` / `facing` changes.
 */
export function useTrailWalker(trail: Trail | null, { initialStop = 0, speed = 46, fastSpeed = 96, onArrive }: Options = {}) {
  const elRef = useRef<HTMLDivElement>(null);
  const tRef = useRef(initialStop);
  const targetRef = useRef(initialStop);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const lastXRef = useRef<number | null>(null);
  const facingRef = useRef<1 | -1>(1);
  const arriveRef = useRef(onArrive);
  const trailRef = useRef(trail);
  const [moving, setMoving] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [ready, setReady] = useState(false);

  arriveRef.current = onArrive;
  trailRef.current = trail;

  const place = useCallback((t: number) => {
    const tr = trailRef.current;
    const el = elRef.current;
    if (!tr || !el) return null;
    const p = pointAt(tr, t);
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    return p;
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  // (Re)place the duck whenever the trail geometry changes (resize, data change).
  useLayoutEffect(() => {
    if (!trail) return;
    tRef.current = Math.min(Math.max(tRef.current, 0), trail.stopCount - 1);
    place(tRef.current);
    setReady(true);
  }, [trail, place]);

  const tick = useCallback(
    (now: number) => {
      const tr = trailRef.current;
      if (!tr) return;
      const dt = Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;
      const remaining = distanceBetween(tr, tRef.current, targetRef.current);
      const v = remaining > 1.3 * Math.max(...tr.lengths) ? fastSpeed : speed;
      const { t, arrived } = stepWalker(tr, tRef.current, targetRef.current, dt, v);
      tRef.current = t;
      const p = place(t);
      if (p) {
        if (lastXRef.current !== null && Math.abs(p.x - lastXRef.current) > 0.25) {
          const f: 1 | -1 = p.x > lastXRef.current ? 1 : -1;
          if (f !== facingRef.current) {
            facingRef.current = f;
            setFacing(f);
          }
        }
        lastXRef.current = p.x;
      }
      if (arrived) {
        rafRef.current = null;
        lastXRef.current = null;
        setMoving(false);
        arriveRef.current?.(Math.round(t));
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [fastSpeed, place, speed],
  );

  const walkTo = useCallback(
    (index: number) => {
      const tr = trailRef.current;
      if (!tr) return;
      const target = Math.min(Math.max(Math.round(index), 0), tr.stopCount - 1);
      targetRef.current = target;
      if (prefersReducedMotion()) {
        stop();
        tRef.current = target;
        place(target);
        setMoving(false);
        arriveRef.current?.(target);
        return;
      }
      if (Math.abs(target - tRef.current) < 1e-9) return;
      setMoving(true);
      if (rafRef.current === null) {
        lastTimeRef.current = performance.now();
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [place, stop, tick],
  );

  useEffect(() => stop, [stop]);

  return { elRef, moving, facing, ready, walkTo, currentStop: () => Math.round(tRef.current) };
}
