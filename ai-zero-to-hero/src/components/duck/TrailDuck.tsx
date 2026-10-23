'use client';
import type { RefObject } from 'react';
import { SittingSprite, WalkingSprite } from './sprites';

/**
 * The duck as it appears on a trail: waddles while `moving`, sits (with a little plop) once it arrives.
 * Position comes from useTrailWalker through `elRef`. Origin of the element = the point on the trail.
 */
export function TrailDuck({
  elRef,
  moving,
  facing,
  ready,
  walkHeight = 120,
  sitHeight = 150,
  sitLift = 40,
}: {
  elRef: RefObject<HTMLDivElement>;
  moving: boolean;
  facing: 1 | -1;
  ready: boolean;
  walkHeight?: number;
  sitHeight?: number;
  /** How far above the trail point the duck sits (the radius of the stop it sits on). */
  sitLift?: number;
}) {
  return (
    <div
      ref={elRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
      style={{ visibility: ready ? 'visible' : 'hidden' }}
    >
      <div
        className="transition-transform duration-300 ease-out"
        style={{ transform: `translate(-50%, calc(-100% + ${moving ? 12 : -sitLift + 6}px))` }}
      >
        {moving ? (
          <WalkingSprite height={walkHeight} flip={facing < 0} />
        ) : (
          <SittingSprite height={sitHeight} flip={facing < 0} />
        )}
      </div>
    </div>
  );
}
