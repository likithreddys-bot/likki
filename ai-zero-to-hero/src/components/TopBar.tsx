import Link from 'next/link';
import { Flame, LogOut, Trophy, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { signOutAction } from '@/lib/actions';
import { initials } from '@/lib/initials';
import type { Profile } from '@/lib/types';

function Pill({ tone, children, label }: { tone: string; children: React.ReactNode; label: string }) {
  return (
    <span
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-[15px] font-bold shadow-hard-sm ${tone}`}
    >
      {children}
    </span>
  );
}

export function TopBar({ profile, active }: { profile: Profile; active?: 'trail' | 'leaderboard' }) {
  const link = (href: string, label: string, key: string) => (
    <Link
      href={href}
      className={`rounded-btn px-3 py-1.5 text-[15px] font-semibold hover:bg-paper2 ${active === key ? 'bg-paper2' : ''}`}
      aria-current={active === key ? 'page' : undefined}
    >
      {label}
    </Link>
  );
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 border-ink bg-card px-4 py-3 sm:px-12 sm:py-4">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" aria-label="AI Zero to Hero — your trail">
          <Logo size={38} />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {link('/dashboard', 'Trail', 'trail')}
          {link('/leaderboard', 'Leaderboard', 'leaderboard')}
        </nav>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Pill tone="bg-yellow" label={`${profile.xp} experience points`}>
          <Zap size={18} strokeWidth={2.4} /> {profile.xp} XP
        </Pill>
        <Pill tone="bg-orange" label={`${profile.streak} day streak`}>
          <Flame size={18} strokeWidth={2.4} /> {profile.streak} day streak
        </Pill>
        <Pill tone="bg-pink-soft" label={`Rank ${profile.rank}`}>
          <Trophy size={18} strokeWidth={2.4} /> {profile.rank}
        </Pill>
        <span
          title={profile.name}
          className="flex size-11 items-center justify-center rounded-full border-[2.5px] border-ink bg-pink font-display-black text-base text-card shadow-hard-sm"
        >
          {initials(profile.name)}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex size-9 items-center justify-center rounded-btn border-2 border-transparent hover:border-ink hover:bg-paper2"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
