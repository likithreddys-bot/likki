'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { buildTrail, dashboardHeight, dashboardNodes, type TrailNode } from '@/lib/trail';
import type { TopicView } from '@/lib/rank';
import { TrailDuck } from '@/components/duck/TrailDuck';
import { StopNode } from './StopNode';
import { TopicStopCard } from './TopicStopCard';
import { useDuckJourney } from './useDuckJourney';

const STAGE_W = 1344;

function useIsDesktop(): boolean | null {
  const [v, setV] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setV(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return v;
}

/** The learning path as a travel map. A duck robot walks to your current topic and sits on it. */
export function TrailMap({ views, currentIndex, userKey }: { views: TopicView[]; currentIndex: number; userKey: string }) {
  const desktop = useIsDesktop();
  if (desktop === null) return <div style={{ minHeight: 600 }} aria-hidden />;
  return desktop ? (
    <DesktopTrail views={views} currentIndex={currentIndex} userKey={userKey} />
  ) : (
    <MobileTrail views={views} currentIndex={currentIndex} userKey={userKey} />
  );
}

/* ───────────────────────────── desktop: 1344 × 1200 stage, scaled to fit ───────────────────────────── */

function DesktopTrail({ views, currentIndex, userKey }: { views: TopicView[]; currentIndex: number; userKey: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / STAGE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const STAGE_H = dashboardHeight(views.length);
  const trail = useMemo(() => buildTrail(dashboardNodes(views.length)), [views.length]);
  const duck = useDuckJourney(trail, currentIndex, userKey);
  const atCurrent = !duck.moving;

  return (
    <div ref={outer} className="relative mx-auto w-full" style={{ maxWidth: STAGE_W, height: STAGE_H * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}>
        <svg className="absolute inset-0" width={STAGE_W} height={STAGE_H} aria-hidden>
          {trail.d.map((d, i) => (
            <path
              key={`up-${i}`}
              d={d}
              fill="none"
              stroke="rgb(var(--ink))"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="1 14"
            />
          ))}
          {trail.d.map((d, i) =>
            i < currentIndex ? (
              <path key={`walked-${i}`} d={d} fill="none" stroke="rgb(var(--pink))" strokeWidth={8} strokeLinecap="round" />
            ) : null,
          )}
        </svg>

        <ol className="contents">
          {views.map((v, i) => {
            const { x, y } = trail.stops[i];
            const isCurrent = i === currentIndex;
            return (
              <li key={v.id} className="contents">
                {isCurrent && (
                  <span
                    className="absolute animate-pulse-ring rounded-full bg-pink"
                    style={{ left: x - 65, top: y - 65, width: 130, height: 130, opacity: 0.22 }}
                    aria-hidden
                  />
                )}
                <span className="absolute" style={{ left: x - 46, top: y - 46 }}>
                  <StopNode status={v.status} number={v.order_index} />
                </span>
                <TopicStopCard
                  view={v}
                  className="absolute w-[300px]"
                  style={{ left: x - 150, top: y + 66 }}
                  onVisit={() => duck.visit(i)}
                  onLeave={duck.leave}
                />
              </li>
            );
          })}
        </ol>

        <span className="hand absolute -rotate-[5deg] text-2xl text-soft" style={{ left: trail.stops[0].x - 80, top: trail.stops[0].y - 100 }}>
          started here
        </span>
        {atCurrent && duck.ready && (
          <span
            className="hand absolute animate-rise text-[32px] text-pink-deep"
            style={{
              left: trail.stops[currentIndex].x < 500 ? trail.stops[currentIndex].x + 70 : trail.stops[currentIndex].x - 200,
              top: trail.stops[currentIndex].y - 122,
              transform: `rotate(${trail.stops[currentIndex].x < 500 ? -4 : 4}deg)`,
            }}
          >
            you are here!
          </span>
        )}

        <TrailDuck elRef={duck.elRef} moving={duck.moving} facing={duck.facing} ready={duck.ready} walkHeight={120} sitHeight={160} sitLift={40} />

        {/* The little robot that strolls along every page's bottom edge is rendered once, in the root layout. */}
        <div className="absolute left-0 w-full" style={{ top: STAGE_H - 108 }} aria-hidden>
          <svg width={STAGE_W} height={80} className="absolute left-0 top-0">
            <path d="M0 50 C 200 10, 400 70, 640 40 S 1000 10, 1344 45" fill="none" stroke="rgb(var(--ink))" strokeWidth={3} strokeLinecap="round" strokeDasharray="1 12" />
          </svg>
          <p className="hand absolute left-[330px] top-[22px] -rotate-2 text-[26px] text-pink">just out for a stroll — i’ll walk to wherever you are</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── mobile: vertical trail, measured from the DOM ───────────────────────────── */

function MobileTrail({ views, currentIndex, userKey }: { views: TopicView[]; currentIndex: number; userKey: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [nodes, setNodes] = useState<TrailNode[] | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const next = nodeRefs.current.map((n) => {
        const r = n!.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, stop: true };
      });
      setNodes(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [views.length]);

  const trail = useMemo(() => (nodes ? buildTrail(nodes, { straight: true }) : null), [nodes]);
  const duck = useDuckJourney(trail, currentIndex, userKey);

  return (
    <div ref={wrap} className="relative">
      {trail && (
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {trail.d.map((d, i) => (
            <path key={`up-${i}`} d={d} fill="none" stroke="rgb(var(--ink))" strokeWidth={3} strokeLinecap="round" strokeDasharray="1 11" />
          ))}
          {trail.d.map((d, i) =>
            i < currentIndex ? <path key={`w-${i}`} d={d} fill="none" stroke="rgb(var(--pink))" strokeWidth={6} strokeLinecap="round" /> : null,
          )}
        </svg>
      )}
      <ol className="relative flex flex-col gap-10">
        {views.map((v, i) => (
          <li key={v.id} className="flex items-start gap-4">
            <span ref={(el) => { nodeRefs.current[i] = el; }} className="mt-6 flex w-[72px] shrink-0 justify-center">
              <StopNode status={v.status} number={v.order_index} size={52} />
            </span>
            <TopicStopCard view={v} className="min-w-0 flex-1" onVisit={() => duck.visit(i)} onLeave={duck.leave} />
          </li>
        ))}
      </ol>
      {trail && <TrailDuck elRef={duck.elRef} moving={duck.moving} facing={duck.facing} ready={duck.ready} walkHeight={72} sitHeight={92} sitLift={18} />}
    </div>
  );
}
