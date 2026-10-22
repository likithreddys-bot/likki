import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { FinalQuiz } from '@/components/quiz/FinalQuiz';
import { buttonVariants } from '@/components/ui/button';
import { getProfile, getSupabase } from '@/lib/session';
import { getTopicContext } from '@/lib/topic-data';
import type { FinalQuizPayload } from '@/lib/types';

export const metadata: Metadata = { title: 'Final quiz' };

export default async function FinalQuizPage({ params }: { params: { slug: string } }) {
  const [profile, ctx] = await Promise.all([getProfile(), getTopicContext(params.slug)]);
  if (!ctx.allDone) redirect(`/topics/${ctx.topic.slug}/${ctx.firstIncomplete ?? 1}`);

  const { data, error } = await getSupabase().rpc('get_final_quiz', { p_topic_id: ctx.topic.id });
  if (error || !data) {
    return (
      <>
        <TopBar profile={profile} active="trail" />
        <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-20">
          <h1 className="font-display-black text-4xl">The quiz isn’t ready</h1>
          <p className="text-soft">{error?.message ?? 'No questions found for this topic.'}</p>
          <div>
            <Link href="/dashboard" className={buttonVariants()}>
              Back to the trail
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar profile={profile} active="trail" />
      <FinalQuiz quiz={data as FinalQuizPayload} slug={ctx.topic.slug} topicTitle={ctx.topic.title} />
    </>
  );
}
