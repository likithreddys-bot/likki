import { redirect } from 'next/navigation';
import { getTopicContext } from '@/lib/topic-data';

/** /topics/[slug] drops you wherever you left off. */
export default async function TopicIndex({ params }: { params: { slug: string } }) {
  const { topic, firstIncomplete, allDone } = await getTopicContext(params.slug);
  if (firstIncomplete !== null) redirect(`/topics/${topic.slug}/${firstIncomplete}`);
  if (allDone && !topic.quiz_passed) redirect(`/topics/${topic.slug}/quiz`);
  redirect(`/topics/${topic.slug}/1`);
}
