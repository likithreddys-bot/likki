import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TopicStatus } from '@/lib/rank';

/** A round stop on the trail: green check = passed, pink number = you are here, cream padlock = locked. */
export function StopNode({ status, number, size = 92 }: { status: TopicStatus; number: number; size?: number }) {
  return (
    <span
      className={cn(
        'relative flex items-center justify-center rounded-full border-[3.5px] border-ink shadow-hard-md',
        status === 'done' && 'bg-green text-card',
        status === 'current' && 'bg-pink text-card',
        status === 'locked' && 'bg-cream text-soft',
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {status === 'done' && <Check size={size * 0.48} strokeWidth={3.5} />}
      {status === 'locked' && <Lock size={size * 0.37} strokeWidth={2.5} />}
      {status === 'current' && (
        <span className="font-display-black leading-none" style={{ fontSize: size * 0.48 }}>
          {number}
        </span>
      )}
    </span>
  );
}
