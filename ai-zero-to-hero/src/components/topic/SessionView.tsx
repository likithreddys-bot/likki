import { TopBar } from '@/components/TopBar';
import { PatrolDuck } from '@/components/duck/sprites';
import { CompleteBar } from '@/components/topic/CompleteBar';
import { InlineQuiz } from '@/components/topic/InlineQuiz';
import { Markdown } from '@/components/topic/Markdown';
import { SessionSidebar } from '@/components/topic/SessionSidebar';
import { YouTubeCard } from '@/components/topic/YouTubeCard';
import type { TopicContext } from '@/lib/topic-data';
import type { InlineQuizRow, Profile, SessionDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SessionView({
  profile,
  ctx,
  detail,
  quizzes,
  order,
}: {
  profile: Profile;
  ctx: TopicContext;
  detail: SessionDetail;
  quizzes: InlineQuizRow[];
  order: number;
}) {
  const total = ctx.sessions.length;
  const doneCount = ctx.sessions.filter((s) => s.done).length;
  const summary = ctx.sessions.find((s) => s.order_index === order)!;
  const next = ctx.sessions.find((s) => s.order_index === order + 1);
  const percent = Math.round((doneCount / total) * 100);

  return (
    <>
      <TopBar profile={profile} active="trail" />
      <div className="relative">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 pb-44 pt-8 sm:px-12 sm:pt-9 lg:flex-row lg:gap-10">
          <SessionSidebar
            slug={ctx.topic.slug}
            topicNumber={ctx.topic.order_index}
            topicTitle={ctx.topic.title}
            sessions={ctx.sessions.map((s) => ({ id: s.id, title: s.title, order: s.order_index, done: s.done }))}
            currentOrder={order}
            allDone={ctx.allDone}
            quizPassed={ctx.topic.quiz_passed}
          />

          <main className="flex min-w-0 max-w-[860px] flex-1 flex-col gap-7">
            <div className="flex flex-col gap-2" aria-label="Topic progress">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-bold">
                  Session {order} of {total}
                </span>
                <span className="font-medium text-soft">
                  {doneCount} {doneCount === 1 ? 'session' : 'sessions'} done · {percent}%
                </span>
              </div>
              <div className="flex gap-2" role="list">
                {ctx.sessions.map((s) => (
                  <span
                    key={s.id}
                    role="listitem"
                    aria-label={`Session ${s.order_index}${s.done ? ' done' : ''}`}
                    className={cn('h-3.5 flex-1 rounded-full border-2 border-ink', s.done ? 'bg-green' : s.order_index === order ? 'bg-pink' : 'bg-card')}
                  />
                ))}
              </div>
            </div>

            <header className="flex flex-col gap-1.5">
              <p className="eyebrow text-pink-deep">
                Topic {ctx.topic.order_index} · Chapter {order}
              </p>
              <h1 className="font-display-black text-[44px] leading-[1.05] sm:text-6xl">{detail.title}</h1>
              <p className="hand text-[26px] text-pink">{ctx.topic.title}</p>
            </header>

            <article className="rounded-card border-[2.5px] border-ink bg-card p-6 shadow-hard-md sm:p-9">
              <Markdown source={detail.content_markdown} />
            </article>

            {detail.youtube_urls?.map((v) => <YouTubeCard key={v.url} video={v} />)}

            {quizzes.map((q, i) => (
              <InlineQuiz key={q.id} quiz={q} number={i + 1} total={quizzes.length} />
            ))}

            <CompleteBar
              sessionId={detail.id}
              slug={ctx.topic.slug}
              order={order}
              isLast={order === total}
              alreadyDone={summary.done}
              nextTitle={next?.title}
            />
          </main>
        </div>
        {/* a little robot strolls along the bottom of the page */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28">
          <PatrolDuck height={92} className="bottom-2" delay={20} />
        </div>
      </div>
    </>
  );
}
