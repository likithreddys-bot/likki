import type { DashboardTopic } from './types';

/** 0–99 Beginner · 100–299 Explorer · 300–499 Builder · 500+ AI Pro  (mirrors rank_for_xp() in SQL). */
export const RANKS = [
  { name: 'Beginner', min: 0 },
  { name: 'Explorer', min: 100 },
  { name: 'Builder', min: 300 },
  { name: 'AI Pro', min: 500 },
] as const;

export const XP_PER_TOPIC = 100;
export const PASS_PERCENT = 70;

export function rankForXp(xp: number): (typeof RANKS)[number]['name'] {
  let current: (typeof RANKS)[number]['name'] = RANKS[0].name;
  for (const r of RANKS) if (xp >= r.min) current = r.name;
  return current;
}

/** XP still needed for the next rank, or null at the top. */
export function nextRank(xp: number): { name: string; needed: number } | null {
  const next = RANKS.find((r) => r.min > xp);
  return next ? { name: next.name, needed: next.min - xp } : null;
}

export type TopicStatus = 'done' | 'current' | 'locked';

export type TopicView = DashboardTopic & {
  status: TopicStatus;
  /** Button label on the trail card. */
  action: 'Review' | 'Start' | 'Continue' | 'Locked';
};

/**
 * Turns the dashboard RPC rows into UI states.
 * The "current" stop is the first unlocked topic whose final quiz is not yet passed
 * (or the last topic once everything is passed — the duck then sits on the graduation stop).
 */
export function buildTopicViews(topics: DashboardTopic[]): { views: TopicView[]; currentIndex: number } {
  const sorted = [...topics].sort((a, b) => a.order_index - b.order_index);
  let currentIndex = sorted.findIndex((t) => t.unlocked && !t.quiz_passed);
  if (currentIndex === -1) currentIndex = Math.max(0, sorted.length - 1);

  const views = sorted.map((t, i): TopicView => {
    if (!t.unlocked) return { ...t, status: 'locked', action: 'Locked' };
    if (t.quiz_passed) return { ...t, status: i === currentIndex ? 'current' : 'done', action: 'Review' };
    return { ...t, status: 'current', action: t.completed_count > 0 ? 'Continue' : 'Start' };
  });
  return { views, currentIndex };
}

export function overallProgress(topics: DashboardTopic[]) {
  const total = topics.reduce((n, t) => n + t.session_count, 0);
  const done = topics.reduce((n, t) => n + t.completed_count, 0);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
