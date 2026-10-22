import { PatrolDuck } from './sprites';

/**
 * One little robot that strolls along the bottom of the window on every page
 * (landing, login, trail, topics, quizzes, leaderboard, setup and error pages).
 * Pure CSS: it keeps walking with no JavaScript, never blocks clicks, and
 * stands still for people who have asked their system for reduced motion.
 */
export function GlobalDuck() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-0 print:hidden">
      <PatrolDuck height={80} className="bottom-1" />
    </div>
  );
}
