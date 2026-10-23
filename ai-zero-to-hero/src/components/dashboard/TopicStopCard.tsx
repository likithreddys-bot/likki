import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { buttonVariants } from '@/components/ui/button';
import type { TopicView } from '@/lib/rank';

/** The card under each stop: chapter, title, description, session progress, and Start / Continue / Review / Locked. */
export function TopicStopCard({
  view,
  className,
  style,
  onVisit,
  onLeave,
}: {
  view: TopicView;
  className?: string;
  style?: React.CSSProperties;
  onVisit?: () => void;
  onLeave?: () => void;
}) {
  const locked = view.status === 'locked';
  const percent = view.session_count ? Math.round((view.completed_count / view.session_count) * 100) : 0;
  const done = view.status === 'done';
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-card border-[2.5px] p-5',
        locked ? 'border-soft bg-paper2' : 'border-ink bg-card shadow-hard-md',
        className,
      )}
      style={style}
      onMouseEnter={locked ? undefined : onVisit}
      onMouseLeave={locked ? undefined : onLeave}
      onFocusCapture={locked ? undefined : onVisit}
      onBlurCapture={locked ? undefined : onLeave}
      aria-label={`Topic ${view.order_index}: ${view.title}${locked ? ' (locked)' : ''}`}
    >
      <p className={cn('eyebrow', locked ? 'text-soft' : 'text-pink-deep')}>Topic {view.order_index}</p>
      <h3 className={cn('font-display-bold text-[23px] leading-7', locked ? 'text-soft' : 'text-ink')}>{view.title}</h3>
      <p className="text-sm leading-5 text-soft">{view.description}</p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-medium text-soft">
            {view.completed_count} of {view.session_count} sessions
          </span>
          <span className={cn('font-bold', locked ? 'text-soft' : 'text-pink-deep')}>{percent}%</span>
        </div>
        <Progress
          value={percent}
          tone={done ? 'green' : 'pink'}
          label={`${view.title}: ${view.completed_count} of ${view.session_count} sessions`}
          className={locked ? 'border-soft bg-cream' : undefined}
        />
      </div>
      {locked ? (
        <button
          type="button"
          disabled
          aria-disabled
          className={cn(buttonVariants({ variant: 'disabled', size: 'sm' }), 'w-full py-[11px]')}
        >
          <Lock size={15} /> Locked
        </button>
      ) : (
        <Link
          href={`/topics/${view.slug}`}
          className={cn(buttonVariants({ variant: view.action === 'Review' ? 'outline' : 'pink', size: 'sm' }), 'w-full py-[11px] text-[15px]')}
        >
          {view.action}
        </Link>
      )}
    </article>
  );
}
