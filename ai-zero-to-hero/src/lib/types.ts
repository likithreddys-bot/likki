export type Video = { title: string; url: string; thumbnail: string };

export type Profile = {
  id: string;
  name: string;
  xp: number;
  streak: number;
  rank: string;
};

/** Shape returned by the get_dashboard() RPC (one entry per topic). */
export type DashboardTopic = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  cover_image_url: string | null;
  session_count: number;
  completed_count: number;
  quiz_passed: boolean;
  best_score: number | null;
  unlocked: boolean;
};

export type SessionSummary = { id: string; title: string; order_index: number };

export type SessionDetail = SessionSummary & {
  topic_id: string;
  content_markdown: string;
  youtube_urls: Video[];
};

export type InlineQuizRow = {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  order_index: number;
};

export type FinalQuizPayload = {
  topic_id: string;
  title: string;
  time_limit_seconds: number;
  pass_percent: number;
  questions: { question: string; options: string[] }[];
};

export type ReviewItem = {
  question: string;
  options: string[];
  your_index: number;
  correct_index: number;
  explanation: string;
  is_correct: boolean;
};

export type FinalQuizResult = {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  first_pass: boolean;
  xp_awarded: number;
  xp: number;
  rank: string;
  streak: number;
  next_topic_slug: string | null;
  review: ReviewItem[];
};

export type LeaderboardRow = {
  user_id: string;
  name: string;
  xp: number;
  topics_completed: number;
  rank: number;
  badge: string;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };
