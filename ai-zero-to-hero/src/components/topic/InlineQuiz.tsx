'use client';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InlineQuizRow } from '@/lib/types';

/** Practice question inside a session. Checked in the browser; never blocks progress. */
export function InlineQuiz({ quiz, number, total }: { quiz: InlineQuizRow; number: number; total: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && picked === quiz.correct_index;

  return (
    <section aria-labelledby={`q-${quiz.id}`} className="flex flex-col gap-4 rounded-card border-[2.5px] border-ink bg-card p-6 shadow-hard-md sm:p-7">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full border-2 border-ink bg-yellow px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em]">Practice</span>
        <span className="text-sm text-soft">
          {total > 1 ? `Question ${number} of ${total} · ` : ''}Doesn’t affect your progress
        </span>
      </div>
      <h3 id={`q-${quiz.id}`} className="font-display-bold text-[26px] leading-8">
        {quiz.question}
      </h3>

      <div role="radiogroup" aria-labelledby={`q-${quiz.id}`} className="flex flex-col gap-3">
        {quiz.options.map((opt, i) => {
          const isPicked = picked === i;
          const showRight = submitted && i === quiz.correct_index;
          const showWrong = submitted && isPicked && i !== quiz.correct_index;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={submitted}
              onClick={() => setPicked(i)}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition-colors',
                !submitted && !isPicked && 'border-ink bg-card hover:bg-paper',
                !submitted && isPicked && 'border-[3px] border-ink bg-pink-soft shadow-hard-sm',
                showRight && 'border-[3px] border-green bg-green/10',
                showWrong && 'border-[3px] border-red bg-red/10',
                submitted && !showRight && !showWrong && 'border-ink/30 text-soft',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-bold',
                  isPicked && !submitted ? 'bg-pink text-card' : 'bg-paper2',
                  showRight && 'border-green bg-green text-card',
                  showWrong && 'border-red bg-red text-card',
                )}
              >
                {showRight ? <Check size={16} strokeWidth={3} /> : showWrong ? <X size={16} strokeWidth={3} /> : String.fromCharCode(65 + i)}
              </span>
              <span className={cn('text-[17px]', isPicked && 'font-semibold')}>{opt}</span>
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          role="status"
          className={cn('rounded-[10px] border-2 p-4 text-[16px] leading-6', correct ? 'border-green bg-green/10' : 'border-ink bg-paper')}
        >
          <p className={cn('mb-1 font-bold', correct ? 'text-green' : 'text-pink-deep')}>
            {correct ? 'Nice — that’s right.' : 'Not quite — and that’s fine, this is practice.'}
          </p>
          <p>{quiz.explanation}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {!submitted ? (
          <>
            <Button onClick={() => setSubmitted(true)} disabled={picked === null} variant={picked === null ? 'disabled' : 'pink'}>
              Submit answer
            </Button>
            <span className="text-sm text-soft">Pick one, then submit</span>
          </>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              setPicked(null);
              setSubmitted(false);
            }}
          >
            Try again
          </Button>
        )}
      </div>
    </section>
  );
}
