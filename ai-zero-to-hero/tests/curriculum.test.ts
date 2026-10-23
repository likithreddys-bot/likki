import { describe, expect, it } from 'vitest';
import { advancedExtras, curriculum, EXPECTED, shuffledCurriculum, shuffleQuiz, TOTALS } from '../src/content/curriculum';
import type { QuizItem } from '../src/content/types';

const allQuizzes = (topics = curriculum): QuizItem[] =>
  topics.flatMap((t) => [...t.sessions.flatMap((s) => s.quizzes), ...t.finalQuiz]);

describe('curriculum matches the spec', () => {
  it('has the topics in the specified order', () => {
    expect(curriculum.map((t) => t.title)).toEqual([
      'What is AI?',
      'How AI Models Work',
      'AI Tools Landscape',
      'Prompt Engineering',
      'API Keys & Integrations',
      'Working with Claude',
      'AI for Data Analysis',
      'Your Own Data with RAG',
      'Agents and Tool Use',
      'Evaluating and Shipping AI',
    ]);
  });

  it.each(EXPECTED.map((e, i) => [i + 1, e] as const))('topic %i has the required counts', (n, e) => {
    const t = curriculum[n - 1];
    expect(t.sessions).toHaveLength(e.sessions);
    expect(t.sessions.reduce((c, s) => c + s.quizzes.length, 0)).toBe(e.inline);
    expect(t.finalQuiz).toHaveLength(e.final);
  });

  it('has the expected totals', () => {
    expect(curriculum).toHaveLength(TOTALS.topics);
    expect(curriculum.reduce((c, t) => c + t.sessions.length, 0)).toBe(TOTALS.sessions);
    expect(TOTALS.sessions).toBeGreaterThanOrEqual(31);
  });

  it('every advanced extra belongs to a real topic', () => {
    const slugs = new Set(curriculum.map((t) => t.slug));
    for (const slug of Object.keys(advancedExtras)) expect(slugs.has(slug)).toBe(true);
  });

  it('topic slugs are unique', () => {
    expect(new Set(curriculum.map((t) => t.slug)).size).toBe(curriculum.length);
  });

  it('every quiz is well-formed', () => {
    for (const q of allQuizzes()) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThanOrEqual(3);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it('question text is unique', () => {
    const qs = allQuizzes().map((q) => q.question);
    expect(new Set(qs).size).toBe(qs.length);
  });

  it('every session has theory, takeaways and a video reference', () => {
    for (const t of curriculum)
      for (const s of t.sessions) {
        expect(s.markdown.length).toBeGreaterThan(900);
        expect(s.markdown).toMatch(/Key takeaways/);
        expect(s.videos.length).toBeGreaterThanOrEqual(1);
        for (const v of s.videos) expect(v.url).toMatch(/^https:\/\/www\.youtube\.com\//);
      }
  });

  it('topic 1 session 1 uses the requested 3Blue1Brown neural network video', () => {
    expect(curriculum[0].sessions[0].videos[0].title).toMatch(/3Blue1Brown/);
  });

  it('content never contains blue/purple styling hints or live-looking secrets', () => {
    const blob = JSON.stringify(curriculum);
    expect(blob).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
  });
});

describe('option shuffling', () => {
  it('keeps the right answer pointing at the same text', () => {
    for (let ti = 0; ti < curriculum.length; ti++) {
      const original = allQuizzes([curriculum[ti]]);
      const shuffled = allQuizzes([shuffledCurriculum()[ti]]);
      original.forEach((q, i) => {
        expect(shuffled[i].options[shuffled[i].correct]).toBe(q.options[q.correct]);
      });
    }
  });

  it('is deterministic', () => {
    const q = curriculum[0].finalQuiz[0];
    expect(shuffleQuiz(q)).toEqual(shuffleQuiz(q));
  });

  it('spreads the correct answer across A–D', () => {
    const counts = [0, 0, 0, 0];
    for (const q of allQuizzes(shuffledCurriculum())) counts[q.correct]++;
    const total = counts.reduce((a, b) => a + b, 0);
    expect(total).toBe(TOTALS.inline + TOTALS.final);
    for (const c of counts) expect(c / total).toBeGreaterThan(0.12);
  });
});
