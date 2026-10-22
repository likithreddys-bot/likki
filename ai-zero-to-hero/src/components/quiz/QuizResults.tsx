'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Flame, Trophy, Unlock, X, Zap } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { SittingSprite } from '@/components/duck/sprites';
import { cn } from '@/lib/utils';
import type { FinalQuizResult } from '@/lib/types';

const CONFETTI = [
  ['bg-pink', 'left-[6%] top-[8%]', 'rotate-12'],
  ['bg-orange', 'left-[12%] top-[26%]', '-rotate-[20deg]'],
  ['bg-yellow', 'right-[8%] top-[10%]', 'rotate-[25deg]'],
  ['bg-pink', 'right-[4%] top-[34%]', '-rotate-[10deg]'],
  ['bg-orange', 'right-[14%] top-[52%]', 'rotate-[40deg]'],
  ['bg-yellow', 'left-[4%] top-[48%]', 'rotate-[15deg]'],
] as const;

function Pill({ tone, icon, children }: { tone: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full border-2 border-ink px-[18px] py-2.5 text-base font-bold shadow-hard-sm', tone)}>
      {icon}
      {children}
    </span>
  );
}

export function QuizResults({
  result,
  slug,
  topicTitle,
  passPercent,
  onRetake,
}: {
  result: FinalQuizResult;
  slug: string;
  topicTitle: string;
  passPercent: number;
  onRetake: () => void;
}) {
  const { passed } = result;
  const graduated = passed && result.next_topic_slug === null;
  const missed = result.review.filter((r) => !r.is_correct).length;

  return (
    <div className="relative mx-auto flex w-full max-w-[760px] flex-col gap-9 px-4 pb-24 pt-12">
      {passed &&
        CONFETTI.map(([bg, pos, rot], i) => (
          <span key={i} aria-hidden className={cn('pointer-events-none absolute h-2.5 w-4 border-[1.5px] border-ink', bg, pos, rot)} />
        ))}

      <section aria-live="polite" className="relative flex flex-col items-center gap-[18px] rounded-2xl border-[3px] border-ink bg-card px-6 py-11 text-center shadow-hard-xl sm:px-12">
        <div
          className={cn(
            'flex size-[220px] flex-col items-center justify-center rounded-full border-[5px] border-ink shadow-hard-lg',
            passed ? 'bg-yellow' : 'bg-pink-soft',
          )}
          role="img"
          aria-label={`Score ${result.score} percent, ${result.correct} of ${result.total} correct`}
        >
          <span className="font-display-black text-[72px] leading-none">{result.score}%</span>
          <span className="mt-1 text-[15px] font-bold">
            {result.correct} of {result.total} correct
          </span>
        </div>

        <h1 className="font-display-black text-4xl leading-[1.1] sm:text-[44px]">
          {graduated ? 'You graduated — AI Pro!' : passed ? 'You passed — nicely done!' : 'Not quite — try again!'}
        </h1>
        <p className="max-w-[520px] text-lg text-soft">
          {graduated
            ? `That was the last quiz. You went from “What is AI?” to building your own assistant.`
            : passed
              ? `You needed ${passPercent}%. ${result.next_topic_slug ? 'The next topic is now unlocked.' : ''}`
              : `You needed ${passPercent}% to pass ${topicTitle}. Look over what you missed below, then retake it — there’s no limit on attempts.`}
        </p>

        {passed && (
          <div className="flex flex-wrap justify-center gap-3">
            {result.xp_awarded > 0 && (
              <Pill tone="bg-yellow" icon={<Zap size={18} />}>
                +{result.xp_awarded} XP
              </Pill>
            )}
            <Pill tone="bg-orange" icon={<Flame size={18} />}>
              {result.streak} day streak
            </Pill>
            <Pill tone="bg-pink-soft" icon={<Trophy size={18} />}>
              Rank: {result.rank}
            </Pill>
            {result.next_topic_slug && (
              <Pill tone="bg-card" icon={<Unlock size={18} />}>
                Next topic unlocked
              </Pill>
            )}
          </div>
        )}
        {passed && result.xp_awarded === 0 && (
          <p className="text-sm text-soft">You’d already passed this topic, so no extra XP this time — your best score is kept.</p>
        )}

        <div className="flex flex-wrap justify-center gap-3.5 pt-1">
          <Link href="/dashboard" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            <ArrowLeft size={18} /> Back to the trail
          </Link>
          {passed && result.next_topic_slug ? (
            <Link href={`/topics/${result.next_topic_slug}`} className={buttonVariants({ variant: 'pink', size: 'lg' })}>
              Continue to the next topic <ArrowRight size={18} />
            </Link>
          ) : !passed ? (
            <Button size="lg" onClick={onRetake}>
              Retake the quiz <ArrowRight size={18} />
            </Button>
          ) : null}
        </div>

        <div aria-hidden className="pointer-events-none absolute -top-[120px] right-4 hidden sm:block">
          <SittingSprite height={170} />
        </div>
      </section>

      <section className="rounded-card border-[2.5px] border-ink bg-card p-6 shadow-hard-md sm:p-8">
        <h2 className="font-display-bold text-[30px]">Answer review</h2>
        <p className="mb-4 text-[15px] text-soft">
          {missed === 0 ? 'A perfect round — every answer was right.' : `You missed ${missed}. Tap any question to see why.`}
        </p>
        <ol className="flex flex-col gap-1.5">
          {result.review.map((r, i) => (
            <li key={i}>
              <details open={!r.is_correct} className={cn('group rounded-[10px] px-4 py-3.5', !r.is_correct && 'border-2 border-ink bg-pink-soft')}>
                <summary className="flex cursor-pointer list-none items-center gap-3.5 [&::-webkit-details-marker]:hidden">
                  <span
                    className={cn('flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-card', r.is_correct ? 'bg-green' : 'bg-red')}
                    aria-label={r.is_correct ? 'Correct' : 'Incorrect'}
                  >
                    {r.is_correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-base font-semibold">
                      {i + 1}. {r.question}
                    </span>
                    <span className={cn('text-sm', r.is_correct ? 'text-soft' : 'font-semibold text-pink-deep')}>
                      {r.is_correct
                        ? r.options[r.correct_index]
                        : `You chose: ${r.your_index >= 0 ? r.options[r.your_index] : 'no answer'}`}
                    </span>
                  </span>
                </summary>
                <div className="mt-3 flex flex-col gap-1.5 rounded-lg border-2 border-ink bg-card px-4 py-3.5 text-sm leading-[1.5]">
                  {!r.is_correct && <p className="font-bold text-green">Correct: {r.options[r.correct_index]}</p>}
                  <p>{r.explanation}</p>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
