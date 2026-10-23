import { describe, expect, it } from 'vitest';
import { safeNext } from '../src/lib/redirect';
import { formatClock } from '../src/lib/time';
import { initials } from '../src/lib/initials';

describe('safeNext', () => {
  it('keeps same-site paths', () => {
    expect(safeNext('/topics/what-is-ai/2')).toBe('/topics/what-is-ai/2');
    expect(safeNext('/leaderboard?x=1')).toBe('/leaderboard?x=1');
  });
  it('rejects open redirects and empty values', () => {
    for (const bad of ['https://evil.com', '//evil.com', 'javascript:alert(1)', '/\\evil.com', '', undefined, null]) {
      expect(safeNext(bad as string | undefined)).toBe('/dashboard');
    }
  });
});

describe('formatClock', () => {
  it('formats the 15:00 quiz countdown', () => {
    expect(formatClock(900)).toBe('15:00');
    expect(formatClock(702)).toBe('11:42');
    expect(formatClock(59.4)).toBe('00:59');
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(-5)).toBe('00:00');
  });
});

describe('initials', () => {
  it('uses first and last name', () => {
    expect(initials('Likith Reddy')).toBe('LR');
    expect(initials('  ada  ')).toBe('A');
    expect(initials('Mary Jane Watson')).toBe('MW');
    expect(initials('')).toBe('?');
  });
});
