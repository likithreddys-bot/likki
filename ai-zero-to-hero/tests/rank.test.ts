import { describe, expect, it } from 'vitest';
import { buildTopicViews, nextRank, overallProgress, rankForXp } from '../src/lib/rank';
import type { DashboardTopic } from '../src/lib/types';

const topic = (i: number, o: Partial<DashboardTopic> = {}): DashboardTopic => ({
  id: `t${i}`, slug: `t${i}`, title: `Topic ${i}`, description: '', order_index: i, cover_image_url: null,
  session_count: 5, completed_count: 0, quiz_passed: false, best_score: null, unlocked: i === 1, ...o,
});

describe('rankForXp', () => {
  it.each([[0, 'Beginner'], [99, 'Beginner'], [100, 'Explorer'], [299, 'Explorer'], [300, 'Builder'], [499, 'Builder'], [500, 'AI Pro'], [600, 'AI Pro']])(
    '%i XP -> %s', (xp, rank) => expect(rankForXp(xp)).toBe(rank));
});

describe('nextRank', () => {
  it('tells how far to the next rank', () => {
    expect(nextRank(0)).toEqual({ name: 'Explorer', needed: 100 });
    expect(nextRank(250)).toEqual({ name: 'Builder', needed: 50 });
    expect(nextRank(500)).toBeNull();
  });
});

describe('buildTopicViews', () => {
  it('a new learner: topic 1 is current/Start, the rest locked', () => {
    const { views, currentIndex } = buildTopicViews([1, 2, 3].map((i) => topic(i)));
    expect(currentIndex).toBe(0);
    expect(views.map((v) => v.status)).toEqual(['current', 'locked', 'locked']);
    expect(views.map((v) => v.action)).toEqual(['Start', 'Locked', 'Locked']);
  });

  it('in progress shows Continue', () => {
    const { views } = buildTopicViews([topic(1, { completed_count: 2 }), topic(2)]);
    expect(views[0].action).toBe('Continue');
  });

  it('after passing topic 1 the duck moves to topic 2', () => {
    const { views, currentIndex } = buildTopicViews([
      topic(1, { quiz_passed: true, completed_count: 5 }),
      topic(2, { unlocked: true, completed_count: 2 }),
      topic(3),
    ]);
    expect(currentIndex).toBe(1);
    expect(views.map((v) => v.status)).toEqual(['done', 'current', 'locked']);
    expect(views.map((v) => v.action)).toEqual(['Review', 'Continue', 'Locked']);
  });

  it('when everything is passed the last stop is current', () => {
    const all = [1, 2, 3].map((i) => topic(i, { unlocked: true, quiz_passed: true, completed_count: 5 }));
    const { views, currentIndex } = buildTopicViews(all);
    expect(currentIndex).toBe(2);
    expect(views[2].status).toBe('current');
    expect(views[2].action).toBe('Review');
  });

  it('sorts by order_index', () => {
    const { views } = buildTopicViews([topic(3), topic(1), topic(2)]);
    expect(views.map((v) => v.order_index)).toEqual([1, 2, 3]);
  });
});

describe('overallProgress', () => {
  it('sums sessions', () => {
    expect(overallProgress([topic(1, { completed_count: 5 }), topic(2, { completed_count: 2 })])).toEqual({ done: 7, total: 10, percent: 70 });
  });
});
