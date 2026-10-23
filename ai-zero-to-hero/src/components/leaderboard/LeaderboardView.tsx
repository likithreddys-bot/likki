import { TopBar } from '@/components/TopBar';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { SittingSprite } from '@/components/duck/sprites';
import type { LeaderboardRow, Profile } from '@/lib/types';

export function LeaderboardView({
  profile,
  rows,
  me,
  totalTopics,
  subscribe = true,
}: {
  profile: Profile;
  rows: LeaderboardRow[];
  me: LeaderboardRow | null;
  totalTopics: number;
  subscribe?: boolean;
}) {
  return (
    <>
      <TopBar profile={profile} active="leaderboard" />
      <div className="relative">
        <main className="mx-auto max-w-[1248px] px-4 pb-40 pt-12 sm:px-12">
          <div className="relative mb-8">
            <p className="hand text-2xl text-pink sm:text-[28px]">who’s ahead on the trail?</p>
            <h1 className="font-display-black text-5xl leading-[1.05] sm:text-[64px]">Leaderboard</h1>
            <p className="mt-1 text-[17px] text-soft">Ranked by XP. +100 XP for every final quiz you pass.</p>
            <div aria-hidden className="pointer-events-none absolute -top-2 right-2 hidden lg:block">
              <SittingSprite height={130} />
            </div>
          </div>
          <LeaderboardTable initialRows={rows} initialMe={me} meId={profile.id} totalTopics={totalTopics} subscribe={subscribe} />
        </main>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-28">
          <p className="hand absolute bottom-3 left-[30%] hidden -rotate-2 text-[26px] text-pink lg:block">catch up by passing quizzes — +100 XP each</p>
        </div>
      </div>
    </>
  );
}
