import { cn } from '@/lib/utils';

/** Logo mark: the robot-duck's head. Same drawing as the Figma "logo-mark". */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <rect x="19" y="34" width="10" height="11" rx="2" fill="rgb(var(--ink))" />
      <path d="M30 20c8-2 14 0 14 4.5S38 30 30 29Z" fill="rgb(var(--orange))" stroke="rgb(var(--ink))" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="22" cy="22" r="16" fill="rgb(var(--pink))" stroke="rgb(var(--ink))" strokeWidth="2.5" />
      <circle cx="25" cy="19" r="7" fill="rgb(var(--yellow))" stroke="rgb(var(--ink))" strokeWidth="2.5" />
      <circle cx="25.5" cy="19" r="3" fill="rgb(var(--ink))" />
    </svg>
  );
}

export function Logo({ size = 40, className, light = false }: { size?: number; className?: string; light?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <span
        className={cn('font-display-black leading-none', light ? 'text-paper' : 'text-ink')}
        style={{ fontSize: size * 0.52, letterSpacing: '-0.01em' }}
      >
        AI Zero to Hero
      </span>
    </span>
  );
}
