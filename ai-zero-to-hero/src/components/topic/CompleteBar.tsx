'use client';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { completeSessionAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'Saving…' : 'Mark Session Complete'}
      {!pending && <Check size={20} strokeWidth={3} />}
    </Button>
  );
}

/** "Mark Session Complete" — saved on the server, then on to the next session (or the final quiz). */
export function CompleteBar({
  sessionId,
  slug,
  order,
  isLast,
  alreadyDone,
  nextTitle,
}: {
  sessionId: string;
  slug: string;
  order: number;
  isLast: boolean;
  alreadyDone: boolean;
  nextTitle?: string;
}) {
  const nextHref = isLast ? `/topics/${slug}/quiz` : `/topics/${slug}/${order + 1}`;
  const nextLabel = isLast ? 'the final quiz' : nextTitle ?? 'the next session';
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-card border-[2.5px] border-ink bg-yellow p-6 shadow-hard-md sm:flex-row sm:items-center">
      <div>
        <p className="font-display-bold text-2xl">{alreadyDone ? 'You’ve finished this session' : 'Done reading?'}</p>
        <p className="text-[15px]">Next up: {nextLabel}</p>
      </div>
      {alreadyDone ? (
        <Link href={nextHref} className={cn(buttonVariants({ variant: 'pink', size: 'lg' }))}>
          {isLast ? 'Go to the final quiz' : 'Next session'} <ArrowRight size={20} />
        </Link>
      ) : (
        <form action={completeSessionAction.bind(null, sessionId, slug, order, isLast)}>
          <SubmitButton />
        </form>
      )}
    </div>
  );
}
