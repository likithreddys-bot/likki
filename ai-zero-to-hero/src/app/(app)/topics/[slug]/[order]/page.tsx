import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SessionView } from '@/components/topic/SessionView';
import { getProfile, getSupabase } from '@/lib/session';
import { getTopicContext } from '@/lib/topic-data';
import type { InlineQuizRow, SessionDetail } from '@/lib/types';

export async function generateMetadata({ params }: { params: { slug: string; order: string } }): Promise<Metadata> {
  const ctx = await getTopicContext(params.slug);
  const s = ctx.sessions.find((x) => x.order_index === Number(params.order));
  return { title: s ? `${s.title} — ${ctx.topic.title}` : ctx.topic.title };
}

export default async function SessionPage({ params }: { params: { slug: string; order: string } }) {
  const order = Number(params.order);
  if (!Number.isInteger(order) || order < 1) notFound();

  const [profile, ctx] = await Promise.all([getProfile(), getTopicContext(params.slug)]);
  const summary = ctx.sessions.find((s) => s.order_index === order);
  if (!summary) notFound();

  const supabase = getSupabase();
  const [{ data: session, error }, { data: quizzes }] = await Promise.all([
    supabase.from('sessions').select('id, topic_id, title, content_markdown, order_index, youtube_urls').eq('id', summary.id).single(),
    supabase.from('inline_quizzes').select('id, question, options, correct_index, explanation, order_index').eq('session_id', summary.id).order('order_index'),
  ]);
  if (error || !session) throw new Error(`Could not load this session: ${error?.message ?? 'not found'}`);

  return (
    <SessionView
      profile={profile}
      ctx={ctx}
      detail={session as unknown as SessionDetail}
      quizzes={(quizzes ?? []) as unknown as InlineQuizRow[]}
      order={order}
    />
  );
}
