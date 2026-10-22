import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';
import { Logo } from '@/components/Logo';
import { SetupNotice } from '@/components/SetupNotice';
import { SittingSprite, PatrolDuck } from '@/components/duck/sprites';
import { getSupabaseEnv } from '@/lib/supabase/env';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; mode?: string } }) {
  if (!getSupabaseEnv()) return <SetupNotice />;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      {/* hand-drawn scenery */}
      <div aria-hidden className="absolute -left-20 top-28 size-64 rounded-full border-[3px] border-ink bg-pink-soft" />
      <div aria-hidden className="absolute right-[8%] top-20 size-36 rounded-full border-[3px] border-ink bg-yellow shadow-hard-md" />
      <svg aria-hidden className="absolute inset-x-0 bottom-0 h-[200px] w-full" preserveAspectRatio="none" viewBox="0 0 1440 200">
        <path d="M-10 150 C 200 60, 380 190, 560 120 S 900 40, 1100 140 S 1350 100, 1450 130" fill="none" stroke="rgb(var(--ink))" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 14" />
      </svg>
      <div aria-hidden className="absolute inset-x-0 bottom-6 h-[120px]">
        <PatrolDuck height={130} className="bottom-0" delay={14} />
      </div>

      <div className="relative w-full max-w-[460px]">
        <div className="pointer-events-none absolute -top-[110px] right-6 hidden sm:block">
          <SittingSprite height={124} />
        </div>
        <div className="flex flex-col items-center gap-6 rounded-2xl border-[3px] border-ink bg-card p-8 shadow-hard-xl sm:p-10">
          <Logo size={40} />
          <div className="w-full">
            <AuthForm next={searchParams.next} initialMode={searchParams.mode === 'signup' ? 'signup' : 'login'} />
          </div>
        </div>
      </div>
    </main>
  );
}
