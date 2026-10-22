import { topic1 } from './topics/01-what-is-ai';
import { topic2 } from './topics/02-how-ai-models-work';
import { topic3 } from './topics/03-ai-tools-landscape';
import { topic4 } from './topics/04-prompt-engineering';
import { topic5 } from './topics/05-api-keys-and-integrations';
import { topic6 } from './topics/06-working-with-claude';
import type { QuizItem, TopicContent } from './types';

/** Order here = unlock order (order_index 1..6). */
export const curriculum: TopicContent[] = [topic1, topic2, topic3, topic4, topic5, topic6];

/** The spec's required counts, per topic. */
export const EXPECTED = [
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 7, final: 10 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 6, inline: 8, final: 10 },
] as const;

export const PASS_PERCENT = 70;

// ── deterministic shuffle so the correct answer is not always in the same slot ──

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuiz(q: QuizItem): QuizItem {
  const rand = mulberry32(hash(q.question));
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    ...q,
    options: order.map((i) => q.options[i]) as QuizItem['options'],
    correct: order.indexOf(q.correct),
  };
}

export function shuffledCurriculum(): TopicContent[] {
  return curriculum.map((t) => ({
    ...t,
    sessions: t.sessions.map((s) => ({ ...s, quizzes: s.quizzes.map(shuffleQuiz) })),
    finalQuiz: t.finalQuiz.map(shuffleQuiz),
  }));
}
