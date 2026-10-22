'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { Trail } from '@/lib/trail';
import { useTrailWalker } from '@/components/duck/useTrailWalker';

const STORAGE_PREFIX = 'azh:duck-stop:';

function readStored(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    const n = raw === null ? NaN : parseInt(raw, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/**
 * The duck's day: it remembers which stop it last sat on, walks from there to the learner's
 * current stop (slowly, with a waddle), and sits. Hovering/focusing an open stop sends it for a visit;
 * a moment after the pointer leaves, it waddles back to the current stop.
 */
export function useDuckJourney(trail: Trail | null, currentIndex: number, userKey: string) {
  const currentRef = useRef(currentIndex);
  currentRef.current = currentIndex;
  const visitTimer = useRef<ReturnType<typeof setTimeout>>();
  const returnTimer = useRef<ReturnType<typeof setTimeout>>();
  const initial = useRef<number | null>(null);
  // First ever visit: start at the first stop. Otherwise start where the duck last sat.
  if (initial.current === null && typeof window !== 'undefined') {
    initial.current = readStored(userKey) ?? 0;
  }

  const walker = useTrailWalker(trail, {
    initialStop: initial.current ?? 0,
    onArrive: (stop) => {
      if (stop === currentRef.current) {
        try {
          window.localStorage.setItem(STORAGE_PREFIX + userKey, String(stop));
        } catch {
          /* private mode: the duck simply starts from the beginning next time */
        }
      }
    },
  });

  const { walkTo, ready } = walker;

  // Walk to the current stop whenever it changes (first load, or after passing a quiz).
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => walkTo(currentIndex), 900);
    return () => clearTimeout(timer);
  }, [ready, currentIndex, walkTo]);

  const visit = useCallback(
    (index: number) => {
      clearTimeout(returnTimer.current);
      clearTimeout(visitTimer.current);
      visitTimer.current = setTimeout(() => walkTo(index), 220);
    },
    [walkTo],
  );
  const leave = useCallback(() => {
    clearTimeout(visitTimer.current);
    clearTimeout(returnTimer.current);
    returnTimer.current = setTimeout(() => walkTo(currentRef.current), 1800);
  }, [walkTo]);

  useEffect(
    () => () => {
      clearTimeout(visitTimer.current);
      clearTimeout(returnTimer.current);
    },
    [],
  );

  return { ...walker, visit, leave };
}
