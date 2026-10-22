import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getDashboardTopics, getSupabase, getUser } from '@/lib/session';
import type { DashboardTopic, SessionSummary } from '@/lib/types';

export type TopicContext = {
  topic: DashboardTopic;
  sessions: (SessionSummary & { done: boolean })[];
  allDone: boolean;
  /** order_index of the first session not yet completed (null when all are done). */
  firstIncomplete: number | null;
};

/** Everything the topic pages need. Locked topics bounce back to the trail (the database enforces it too). */
export const getTopicContext = cache(async (slug: string): Promise<TopicContext> => {
  const user = await getUser();
  const supabase = getSupabase();
  const topics = await getDashboardTopics();
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) notFound();
  if (!topic.unlocked) redirect('/dashboard');

  const [{ data: sessions, error: sErr }, { data: progress, error: pErr }] = await Promise.all([
    supabase.from('sessions').select('id, title, order_index').eq('topic_id', topic.id).order('order_index'),
    supabase
      .from('user_progress')
      .select('session_id')
      .eq('user_id', user.id)
      .eq('topic_id', topic.id)
      .eq('completed', true)
      .not('session_id', 'is', null),
  ]);
  if (sErr || pErr) throw new Error(`Could not load this topic: ${(sErr ?? pErr)!.message}`);

  const doneIds = new Set((progress ?? []).map((p) => p.session_id as string));
  const list = (sessions ?? []).map((s) => ({ ...s, done: doneIds.has(s.id) }));
  const firstIncomplete = list.find((s) => !s.done)?.order_index ?? null;
  return { topic, sessions: list, allDone: list.length > 0 && firstIncomplete === null, firstIncomplete };
});
