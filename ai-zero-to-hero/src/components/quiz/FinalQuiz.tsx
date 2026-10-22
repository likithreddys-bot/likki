'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clock, DoorOpen } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { PatrolDuck, SittingSprite } from '@/components/duck/sprites';
import { submitFinalQuizAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { formatClock } from '@/lib/time';
import type { FinalQuizPayload, FinalQuizResult } from '@/lib/types';
import { QuizResults } from './QuizResults';


type Phase = 'quiz' | 'submitting' | 'result';

/** One question at a time, a 15:00 countdown, and server-side grading. */
export function FinalQuiz({ quiz, slug, topicTitle }: { quiz: FinalQuizPayload; slug: string; topicTitle: string }) {
  const total = quiz.questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => Array(total).fill(-1));
  const [phase, setPhase] = useState<Phase>('quiz');
  const [result, setResult] = useState<FinalQuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(quiz.time_limit_seconds);
  const [attempt, setAttempt] = useState(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submittingRef = useRef(false);

  const submit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase('submitting');
    setError(null);
    const res = await submitFinalQuizAction(quiz.topic_id, answersRef.current);
    submittingRef.current = false;
    if (res.ok) {
      setResult(res.data);
      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(res.error);
      setPhase('quiz');
    }
  }, [quiz.topic_id]);

  // countdown (restarts on each attempt); auto-submits at 00:00
  useEffect(() => {
    if (phase !== 'quiz') return;
    const endsAt = Date.now() + remaining * 1000;
    const id = setInterval(() => {
      const left = Math.round((endsAt - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(id);
        void submit();
      }
    }, 250);
    return () => clearInterval(id);
    // `remaining` is deliberately not a dependency: the deadline is fixed when the quiz (re)starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, attempt, submit]);

  const select = useCallback(
    (i: number) => setAnswers((prev) => prev.map((a, k) => (k === index ? i : a))),
    [index],
  );

  // A–D keys pick an option
  useEffect(() => {
    if (phase !== 'quiz') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = 'abcd'.indexOf(e.key.toLowerCase());
      if (i >= 0 && i < quiz.questions[index].options.length && (e.target as HTMLElement).tagName !== 'INPUT') select(i);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, index, quiz.questions, select]);

  if (phase === 'result' && result) {
    return (
      <QuizResults
        result={result}
        slug={slug}
        topicTitle={topicTitle}
        passPercent={quiz.pass_percent}
        onRetake={() => {
          setAnswers(Array(total).fill(-1));
          setIndex(0);
          setResult(null);
          setRemaining(quiz.time_limit_seconds);
          setAttempt((a) => a + 1);
          setPhase('quiz');
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  const q = quiz.questions[index];
  const unanswered = answers.filter((a) => a < 0).length;
  const isLast = index === total - 1;
  const low = remaining <= 60;

  return (
    <div className="relative mx-auto flex w-full max-w-[760px] flex-col items-center gap-6 px-4 pb-32 pt-12">
      <p className="hand text-[28px] text-pink">
        {topicTitle} — final quiz
      </p>

      <div className="relative w-full">
        <div aria-hidden className="pointer-events-none absolute -top-[128px] right-[-150px] hidden xl:block">
          <SittingSprite height={150} />
        </div>
        <section className="flex w-full flex-col gap-6 rounded-2xl border-[3px] border-ink bg-card p-6 shadow-hard-xl sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="eyebrow text-pink-deep" aria-live="polite">
                Question {index + 1} of {total}
              </p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jump to question">
                {answers.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Question ${i + 1}${a >= 0 ? ', answered' : ', not answered yet'}${i === index ? ', current' : ''}`}
                    aria-current={i === index}
                    className={cn(
                      'size-3.5 rounded-full border-2 border-ink',
                      i === index ? 'bg-pink' : a >= 0 ? 'bg-green' : 'bg-card',
                    )}
                  />
                ))}
              </div>
            </div>
            <div
              role="timer"
              aria-label={`Time left ${formatClock(remaining)}`}
              className={cn(
                'flex items-center gap-2 rounded-full border-[2.5px] border-ink px-[18px] py-2.5 shadow-hard-sm',
                low ? 'bg-red text-card' : 'bg-yellow',
              )}
            >
              <Clock size={22} strokeWidth={2.5} aria-hidden />
              <span className="font-display-black text-[30px] leading-none tabular-nums" style={{ letterSpacing: 0 }}>
                {formatClock(remaining)}
              </span>
            </div>
          </div>

          <h1 className="font-display-bold text-[28px] leading-[1.25] sm:text-[34px] sm:leading-[1.2]">{q.question}</h1>

          <div role="radiogroup" aria-label="Answers" className="flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const picked = answers[index] === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => select(i)}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border-2 border-ink px-[18px] py-4 text-left transition-colors',
                    picked ? 'border-[3px] bg-pink-soft shadow-hard-sm' : 'bg-card hover:bg-paper',
                  )}
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-base font-bold', picked ? 'bg-pink text-card' : 'bg-paper2')}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={cn('text-lg leading-[1.45]', picked && 'font-semibold')}>{opt}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="rounded-btn border-2 border-red bg-red/10 px-3 py-2 text-sm font-medium text-red">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0} className={index === 0 ? 'opacity-50' : undefined}>
              <ArrowLeft size={16} /> Previous
            </Button>
            {isLast ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-soft">
                  {unanswered > 0 ? `${unanswered} unanswered — they’ll count as wrong` : `${quiz.pass_percent}% to pass`}
                </span>
                <Button size="lg" onClick={submit} disabled={phase === 'submitting'}>
                  {phase === 'submitting' ? 'Marking…' : 'Submit Quiz'} <Check size={20} strokeWidth={3} />
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>Next question</Button>
            )}
          </div>
        </section>
      </div>

      <div className="flex w-full items-center justify-between text-sm text-soft">
        <span>Tip: press A, B, C or D to answer.</span>
        <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-soft')}>
          <DoorOpen size={16} /> Exit quiz
        </Link>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24">
        <PatrolDuck height={88} className="bottom-2" delay={5} />
      </div>
    </div>
  );
}
