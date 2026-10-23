import { notFound } from 'next/navigation';
import { curriculum } from '@/content/curriculum';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { FinalQuiz } from '@/components/quiz/FinalQuiz';
import { SessionView } from '@/components/topic/SessionView';
import { TopBar } from '@/components/TopBar';
import { PreviewResults } from '../PreviewResults';
import { dashboardTopics, finalQuizPayload, leaderboardMe, leaderboardRows, profile, resultFixture, sessionFixture } from '../fixtures';

export const dynamic = 'force-dynamic';

/**
 * Design preview: renders the real screens from fixture data so they can be reviewed and screenshotted
 * without a database. Disabled in production builds.
 */
export default function Preview({ params, searchParams }: { params: { screen: string }; searchParams: { state?: string; order?: string } }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const state = (['fresh', 'progress', 'done'] as const).find((s) => s === searchParams.state) ?? 'progress';

  switch (params.screen) {
    case 'dashboard':
      return <DashboardView profile={profile} topics={dashboardTopics(state)} />;
    case 'session': {
      const order = Math.min(5, Math.max(1, Number(searchParams.order) || 3));
      const f = sessionFixture(order);
      return <SessionView profile={profile} ctx={f.ctx} detail={f.detail} quizzes={f.quizzes} order={order} />;
    }
    case 'quiz':
      return (
        <>
          <TopBar profile={profile} active="trail" />
          <FinalQuiz quiz={finalQuizPayload} slug="how-ai-models-work" topicTitle={finalQuizPayload.title} />
        </>
      );
    case 'results':
    case 'results-fail':
      return (
        <>
          <TopBar profile={profile} active="trail" />
          <PreviewResults result={resultFixture(params.screen === 'results')} topicTitle={finalQuizPayload.title} />
        </>
      );
    case 'leaderboard':
      return <LeaderboardView profile={profile} rows={leaderboardRows} me={leaderboardMe} totalTopics={curriculum.length} subscribe={false} />;
    default:
      notFound();
  }
}
