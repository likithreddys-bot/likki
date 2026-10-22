'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { buildTrail, TEASER_NODES } from '@/lib/trail';
import { TrailDuck } from '@/components/duck/TrailDuck';
import { useTrailWalker } from '@/components/duck/useTrailWalker';
import { cn } from '@/lib/utils';

const W = 1280;
const H = 260;
const NAMES = ['What is AI?', 'How models work', 'AI tools', 'Prompting', 'API keys', 'Working with Claude'];
const TONES = ['bg-pink', 'bg-orange', 'bg-yellow', 'bg-pink', 'bg-orange', 'bg-yellow'];

/** The landing-page trail: the duck waddles from stop to stop, sits for a bit, then carries on — forwards and back. */
export function TrailTeaser() {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const trail = useMemo(() => buildTrail(TEASER_NODES), []);
  const dirRef = useRef<1 | -1>(1);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const walkRef = useRef<(i: number) => void>(() => {});

  const { elRef, moving, facing, ready, walkTo } = useTrailWalker(trail, {
    initialStop: 0,
    onArrive: (stop) => {
      // rest a moment on each stop, then head for the next (turning around at the ends)
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (stop >= trail.stopCount - 1) dirRef.current = -1;
        if (stop <= 0) dirRef.current = 1;
        walkRef.current(stop + dirRef.current);
      }, 2600);
    },
  });
  walkRef.current = walkTo;

  useEffect(() => {
    if (!ready) return;
    timer.current = setTimeout(() => walkTo(1), 1400);
    return () => clearTimeout(timer.current);
  }, [ready, walkTo]);

  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(Math.max(0.55, Math.min(1, el.clientWidth / W)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full overflow-x-auto pt-[80px] sm:-mt-6">
      <div ref={outer} className="relative mx-auto" style={{ maxWidth: W, height: H * scale, minWidth: W * 0.55 }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <svg className="absolute inset-0" width={W} height={H} aria-hidden>
            {trail.d.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="rgb(var(--ink))" strokeWidth={4} strokeLinecap="round" strokeDasharray="1 14" />
            ))}
          </svg>
          <ol className="contents">
            {trail.stops.map((s, i) => (
              <li key={i} className="contents">
                <span
                  className={cn('absolute flex size-[68px] items-center justify-center rounded-full border-[3px] border-ink shadow-hard font-display-black text-[28px]', TONES[i])}
                  style={{ left: s.x - 34, top: s.y - 34 }}
                >
                  {i + 1}
                </span>
                <span className="absolute w-40 text-center text-[15px] font-semibold" style={{ left: s.x - 80, top: s.y + 44 }}>
                  {NAMES[i]}
                </span>
              </li>
            ))}
          </ol>
          <span className="hand absolute -rotate-6 text-[28px] text-pink" style={{ left: trail.stops[0].x - 60, top: trail.stops[0].y - 100 }}>
            start here!
          </span>
          <span className="hand absolute -rotate-2 text-[26px] text-pink-deep" style={{ left: trail.stops[2].x - 60, top: 14 }}>
            slow and steady, like a duck
          </span>
          <TrailDuck elRef={elRef} moving={moving} facing={facing} ready={ready} walkHeight={116} sitHeight={128} sitLift={30} />
        </div>
      </div>
    </div>
  );
}
