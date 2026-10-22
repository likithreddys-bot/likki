import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Source art: three cut-outs generated for the project (see public/robot). Aspect = width / height. */
const SPRITES = {
  walkA: { src: '/robot/walk-a.png', ar: 335 / 480 },
  walkB: { src: '/robot/walk-b.png', ar: 349 / 480 },
  sit: { src: '/robot/sit.png', ar: 303 / 480 },
} as const;

const WALK_AR = 0.73;

/**
 * Walking pose: two frames that swap with CSS (so it keeps stepping with no JS)
 * plus a slow side-to-side waddle. The art faces right; `flip` turns it to face left.
 */
export function WalkingSprite({ height, flip = false, className }: { height: number; flip?: boolean; className?: string }) {
  const width = Math.round(height * WALK_AR);
  return (
    <div
      aria-hidden
      className={cn('relative shrink-0', className)}
      style={{ height, width, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <div className="absolute inset-0 origin-bottom animate-waddle">
        <Image
          src={SPRITES.walkA.src}
          alt=""
          fill
          unoptimized
          loading="eager"
          sizes={`${width}px`}
          className="animate-frame-a object-contain object-bottom"
        />
        <Image
          src={SPRITES.walkB.src}
          alt=""
          fill
          unoptimized
          loading="eager"
          sizes={`${width}px`}
          className="animate-frame-b object-contain object-bottom opacity-0"
        />
      </div>
    </div>
  );
}

/** Sitting pose, with a small "plop" when it appears and a gentle breathing loop. The art faces left. */
export function SittingSprite({ height, flip = false, className }: { height: number; flip?: boolean; className?: string }) {
  const width = Math.round(height * SPRITES.sit.ar);
  return (
    <div
      aria-hidden
      className={cn('relative shrink-0', className)}
      style={{ height, width, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <div className="absolute inset-0 origin-bottom animate-plop">
        <div className="absolute inset-0 origin-bottom animate-breathe">
          <Image src={SPRITES.sit.src} alt="" fill unoptimized loading="eager" sizes={`${width}px`} className="object-contain object-bottom" />
        </div>
      </div>
    </div>
  );
}

/** A duck that strolls back and forth along the bottom edge of its (relative) parent. Pure CSS. */
export function PatrolDuck({ height = 84, className, delay = 0 }: { height?: number; className?: string; delay?: number }) {
  const width = Math.round(height * WALK_AR);
  return (
    <div
      aria-hidden
      className={cn('duck-patrol pointer-events-none', className)}
      style={{ ['--duck-w' as string]: `${width}px`, animationDelay: `-${delay}s` }}
    >
      <div className="duck-flip" style={{ animationDelay: `-${delay}s` }}>
        <WalkingSprite height={height} />
      </div>
    </div>
  );
}
