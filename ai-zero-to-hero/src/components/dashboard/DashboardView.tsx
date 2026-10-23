import { TopBar } from '@/components/TopBar';
import { TrailMap } from '@/components/dashboard/TrailMap';
import { buildTopicViews, overallProgress } from '@/lib/rank';
import type { DashboardTopic, Profile } from '@/lib/types';

export function DashboardView({ profile, topics }: { profile: Profile; topics: DashboardTopic[] }) {
  const { views, currentIndex } = buildTopicViews(topics);
  const progress = overallProgress(topics);
  const firstName = profile.name.split(' ')[0];
  const current = views[currentIndex];

  return (
    <>
      <TopBar profile={profile} active="trail" />
      <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-12 sm:pt-12">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="hand text-2xl text-pink sm:text-[28px]">
              welcome back, {firstName} — you’re on stop {current?.order_index ?? 1}
            </p>
            <h1 className="font-display-black text-5xl leading-[1.05] sm:text-6xl">Your Learning Path</h1>
            <p className="mt-1 text-[17px] text-soft">Pass each final quiz with 70% to unlock the next stop.</p>
          </div>
          <div className="w-full rounded-card border-[2.5px] border-ink bg-card px-5 py-4 shadow-hard lg:w-[300px]">
            <div className="mb-2.5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-soft">Overall progress</span>
              <span className="font-bold">
                {progress.done} / {progress.total} sessions
              </span>
            </div>
            <div
              className="h-3.5 overflow-hidden rounded-full border-2 border-ink bg-paper2"
              role="progressbar"
              aria-valuenow={progress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall progress"
            >
              <div className="h-full rounded-full bg-pink transition-[width] duration-700" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>
        <TrailMap views={views} currentIndex={currentIndex} userKey={profile.id} />
      </main>
    </>
  );
}
