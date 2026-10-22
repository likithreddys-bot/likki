import { shuffledCurriculum } from '@/content/curriculum';
import type { TopicContext } from '@/lib/topic-data';
import type {
  DashboardTopic,
  FinalQuizPayload,
  FinalQuizResult,
  InlineQuizRow,
  LeaderboardRow,
  Profile,
  SessionDetail,
} from '@/lib/types';

/** Design-preview data built from the real curriculum. Only used by /preview/* in development. */
const topics = shuffledCurriculum();

export const profile: Profile = { id: 'preview-user', name: 'Likith Reddy', xp: 100, streak: 5, rank: 'Explorer' };

export function dashboardTopics(state: 'fresh' | 'progress' | 'done'): DashboardTopic[] {
  return topics.map((t, i): DashboardTopic => {
    const n = t.sessions.length;
    const passed = state === 'done' || (state === 'progress' && i === 0);
    const unlocked = state === 'done' || i === 0 || (state === 'progress' && i === 1);
    const inProgress = state === 'progress' && i === 1;
    return {
      id: `topic-${i + 1}`,
      slug: t.slug,
      title: t.title,
      description: t.description,
      order_index: i + 1,
      cover_image_url: `/covers/${t.slug}.svg`,
      session_count: n,
      completed_count: passed ? n : inProgress ? 2 : 0,
      quiz_passed: passed,
      best_score: passed ? 88 : null,
      unlocked,
    };
  });
}

const T2 = topics[1];

export function sessionFixture(order = 3): { ctx: TopicContext; detail: SessionDetail; quizzes: InlineQuizRow[] } {
  const topic = dashboardTopics('progress')[1];
  const sessions = T2.sessions.map((s, i) => ({ id: `s-${i + 1}`, title: s.title, order_index: i + 1, done: i + 1 < order }));
  const s = T2.sessions[order - 1];
  return {
    ctx: { topic, sessions, allDone: false, firstIncomplete: order },
    detail: { id: `s-${order}`, topic_id: topic.id, title: s.title, content_markdown: s.markdown, order_index: order, youtube_urls: s.videos },
    quizzes: s.quizzes.map((q, i) => ({ id: `q-${order}-${i}`, question: q.question, options: q.options, correct_index: q.correct, explanation: q.explanation, order_index: i + 1 })),
  };
}

export const finalQuizPayload: FinalQuizPayload = {
  topic_id: 'topic-2',
  title: T2.title,
  time_limit_seconds: 900,
  pass_percent: 70,
  questions: T2.finalQuiz.map((q) => ({ question: q.question, options: q.options })),
};

export function resultFixture(pass: boolean): FinalQuizResult {
  const wrongAt = pass ? [4] : [0, 2, 3, 5, 6];
  const review = T2.finalQuiz.map((q, i) => {
    const wrong = wrongAt.includes(i);
    return {
      question: q.question,
      options: q.options,
      your_index: wrong ? (q.correct + 1) % 4 : q.correct,
      correct_index: q.correct,
      explanation: q.explanation,
      is_correct: !wrong,
    };
  });
  const correct = review.filter((r) => r.is_correct).length;
  return {
    score: Math.round((correct / review.length) * 100),
    correct,
    total: review.length,
    passed: pass,
    first_pass: pass,
    xp_awarded: pass ? 100 : 0,
    xp: pass ? 200 : 100,
    rank: 'Explorer',
    streak: 6,
    next_topic_slug: pass ? 'ai-tools-landscape' : null,
    review,
  };
}

const board: [string, number, number, string][] = [
  ['Priya Nair', 620, 6, 'AI Pro'],
  ['Marcus Tran', 540, 6, 'AI Pro'],
  ['Aiko Sato', 410, 4, 'Builder'],
  ['Daniel Okafor', 360, 3, 'Builder'],
  ['Sofia Rossi', 340, 3, 'Builder'],
  ['Jonas Keller', 290, 2, 'Explorer'],
  ['Meera Das', 240, 2, 'Explorer'],
  ['Tom Walker', 210, 2, 'Explorer'],
];
export const leaderboardRows: LeaderboardRow[] = board.map(([name, xp, done, badge], i) => ({
  user_id: `u-${i}`,
  name,
  xp,
  topics_completed: done,
  rank: i + 1,
  badge,
}));
export const leaderboardMe: LeaderboardRow = { user_id: profile.id, name: profile.name, xp: 100, topics_completed: 1, rank: 12, badge: 'Explorer' };
