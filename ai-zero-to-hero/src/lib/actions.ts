'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult, FinalQuizResult } from '@/lib/types';

export async function signOutAction() {
  await createClient().auth.signOut();
  redirect('/');
}

/** Marks a session complete (server-side check that the topic is unlocked), then moves on. */
export async function completeSessionAction(sessionId: string, topicSlug: string, order: number, isLast: boolean) {
  const supabase = createClient();
  const { error } = await supabase.rpc('complete_session', { p_session_id: sessionId });
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard');
  revalidatePath(`/topics/${topicSlug}`, 'layout');
  redirect(isLast ? `/topics/${topicSlug}/quiz` : `/topics/${topicSlug}/${order + 1}`);
}

/** Grades the final quiz on the server. Answers are indexes into each question's options (-1 = unanswered). */
export async function submitFinalQuizAction(topicId: string, answers: number[]): Promise<ActionResult<FinalQuizResult>> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('submit_final_quiz', { p_topic_id: topicId, p_answers: answers });
  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  revalidatePath('/topics', 'layout');
  return { ok: true, data: data as FinalQuizResult };
}
