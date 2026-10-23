import { topic1 } from './topics/01-what-is-ai';
import { topic2 } from './topics/02-how-ai-models-work';
import { topic3 } from './topics/03-ai-tools-landscape';
import { topic4 } from './topics/04-prompt-engineering';
import { topic5 } from './topics/05-api-keys-and-integrations';
import { topic6 } from './topics/06-working-with-claude';
import { topic7 } from './topics/07-ai-for-data-analysis';
import { topic8 } from './topics/08-your-own-data-rag';
import { topic9 } from './topics/09-agents-and-tool-use';
import { topic10 } from './topics/10-evaluating-and-shipping-ai';
import type { QuizItem, TopicContent } from './types';

/** Order here = unlock order (order_index 1..n). Topics 1–6 are the foundations; 7–10 are the advanced track. */
export const curriculum: TopicContent[] = [topic1, topic2, topic3, topic4, topic5, topic6, topic7, topic8, topic9, topic10];

/** The required counts, per topic (topics 1–6 from the original spec, 7–10 for the advanced track). */
export const EXPECTED = [
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 5, inline: 7, final: 10 },
  { sessions: 5, inline: 6, final: 8 },
  { sessions: 6, inline: 8, final: 10 },
  { sessions: 5, inline: 6, final: 10 },
  { sessions: 5, inline: 7, final: 10 },
  { sessions: 5, inline: 7, final: 10 },
  { sessions: 5, inline: 7, final: 10 },
] as const;

/** Totals across the whole curriculum, derived so copy and tests never drift. */
export const TOTALS = {
  topics: EXPECTED.length,
  sessions: EXPECTED.reduce((n, e) => n + e.sessions, 0),
  questions: EXPECTED.reduce((n, e) => n + e.inline + e.final, 0),
  inline: EXPECTED.reduce((n, e) => n + e.inline, 0),
  final: EXPECTED.reduce((n, e) => n + e.final, 0),
};

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
