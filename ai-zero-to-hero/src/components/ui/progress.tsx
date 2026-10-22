import { cn } from '@/lib/utils';

/** Ink-outlined progress track. `value` is 0–100. */
export function Progress({
  value,
  tone = 'pink',
  className,
  label,
}: {
  value: number;
  tone?: 'pink' | 'green';
  className?: string;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-label={label}
      className={cn('h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-paper2', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-700', tone === 'green' ? 'bg-green' : 'bg-pink')}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
