'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Lock, Menu, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarSession = { id: string; title: string; order: number; done: boolean };

/** Collapsible list of the topic's sessions with check marks. On phones it opens from a button. */
export function SessionSidebar({
  slug,
  topicNumber,
  topicTitle,
  sessions,
  currentOrder,
  allDone,
  quizPassed,
  onQuizPage = false,
}: {
  slug: string;
  topicNumber: number;
  topicTitle: string;
  sessions: SidebarSession[];
  currentOrder: number | null;
  allDone: boolean;
  quizPassed: boolean;
  onQuizPage?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const doneCount = sessions.filter((s) => s.done).length;

  return (
    <aside className={cn('shrink-0 lg:sticky lg:top-6 lg:self-start', collapsed ? 'lg:w-[72px]' : 'lg:w-[320px]')} aria-label="Sessions in this topic">
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-between rounded-card border-2 border-ink bg-card px-4 py-3 font-bold shadow-hard-sm lg:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2">
          <Menu size={18} /> Sessions ({doneCount}/{sessions.length} done)
        </span>
        <ChevronRight size={18} className={cn('transition-transform', mobileOpen && 'rotate-90')} />
      </button>

      <div className={cn('flex-col gap-3.5 rounded-card border-[2.5px] border-ink bg-card p-5 shadow-hard-md', mobileOpen ? 'flex' : 'hidden', 'lg:flex', collapsed && 'lg:items-center lg:px-2.5')}>
        <div className={cn('flex items-center justify-between gap-2', collapsed && 'lg:flex-col')}>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm font-bold text-pink-deep hover:underline" aria-label="Back to the learning path">
            <ChevronLeft size={16} strokeWidth={2.75} />
            <span className={cn(collapsed && 'lg:hidden')}>Learning path</span>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="hidden size-8 items-center justify-center rounded-btn border-2 border-ink bg-paper2 hover:bg-cream lg:flex"
            aria-label={collapsed ? 'Expand sessions list' : 'Collapse sessions list'}
            aria-pressed={collapsed}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={2.75} /> : <ChevronLeft size={16} strokeWidth={2.75} />}
          </button>
        </div>

        <div className={cn(collapsed && 'lg:hidden')}>
          <p className="eyebrow text-pink-deep">Topic {topicNumber}</p>
          <h2 className="font-display-bold text-[26px] leading-[30px]">{topicTitle}</h2>
        </div>
        <div className={cn('h-0.5 w-full bg-ink', collapsed && 'lg:hidden')} />

        <ol className="flex flex-col gap-1.5">
          {sessions.map((s) => {
            const current = s.order === currentOrder;
            return (
              <li key={s.id}>
                <Link
                  href={`/topics/${slug}/${s.order}`}
                  aria-current={current ? 'page' : undefined}
                  title={s.title}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] border-2 px-3 py-2.5 hover:bg-paper2',
                    current ? 'border-ink bg-pink-soft hover:bg-pink-soft' : 'border-transparent',
                    collapsed && 'lg:justify-center lg:px-1.5',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-bold',
                      s.done ? 'bg-green text-card' : current ? 'bg-pink text-card' : 'bg-card text-soft',
                    )}
                  >
                    {s.done ? <Check size={16} strokeWidth={3} /> : s.order}
                  </span>
                  <span className={cn('text-[15px] leading-tight', current ? 'font-bold' : s.done ? 'font-medium' : 'font-medium text-soft', collapsed && 'lg:hidden')}>
                    {s.title}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            {allDone ? (
              <Link
                href={`/topics/${slug}/quiz`}
                aria-current={onQuizPage ? 'page' : undefined}
                title="Final quiz"
                className={cn(
                  'flex items-center gap-3 rounded-[10px] border-2 border-ink px-3 py-2.5',
                  onQuizPage ? 'bg-pink-soft' : 'bg-yellow hover:bg-yellow/80',
                  collapsed && 'lg:justify-center lg:px-1.5',
                )}
              >
                <span className={cn('flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 border-ink', quizPassed ? 'bg-green text-card' : 'bg-card')}>
                  {quizPassed ? <Check size={16} strokeWidth={3} /> : <Trophy size={15} />}
                </span>
                <span className={cn('flex flex-col leading-tight', collapsed && 'lg:hidden')}>
                  <span className="text-[15px] font-bold">Final quiz</span>
                  <span className="text-xs">{quizPassed ? 'Passed — retake any time' : '70% to unlock the next topic'}</span>
                </span>
              </Link>
            ) : (
              <div
                className={cn('flex items-center gap-3 rounded-[10px] border-2 border-soft bg-paper2 px-3 py-2.5', collapsed && 'lg:justify-center lg:px-1.5')}
                aria-disabled
                title="Finish all sessions first"
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 border-soft bg-cream text-soft">
                  <Lock size={14} strokeWidth={2.5} />
                </span>
                <span className={cn('flex flex-col leading-tight text-soft', collapsed && 'lg:hidden')}>
                  <span className="text-[15px] font-bold">Final quiz</span>
                  <span className="text-xs">Finish all {sessions.length} sessions first</span>
                </span>
              </div>
            )}
          </li>
        </ol>
      </div>
    </aside>
  );
}
