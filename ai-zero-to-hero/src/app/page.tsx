import Link from 'next/link';
import { ArrowRight, BookOpen, Bot, ClipboardCheck, Flag, Layers, Trophy } from 'lucide-react';
import { Logo, LogoMark } from '@/components/Logo';
import { buttonVariants } from '@/components/ui/button';
import { SittingSprite } from '@/components/duck/sprites';
import { TrailTeaser } from '@/components/landing/TrailTeaser';
import { curriculum, TOTALS } from '@/content/curriculum';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Layers,
    tone: 'bg-pink',
    title: 'Structured Path',
    text: `${TOTALS.topics} topics in a fixed order — from “what is AI?” through prompting and APIs to agents, your own data and shipping AI safely. You always know what’s next.`,
  },
  {
    icon: ClipboardCheck,
    tone: 'bg-orange',
    title: 'Quiz & Unlock',
    text: 'Pass each final quiz with 70% to open the next stop. Practice questions along the way never block you.',
  },
  {
    icon: Bot,
    tone: 'bg-yellow',
    title: 'Real AI Tools',
    text: 'ChatGPT, Claude, API keys and markdown projects — hands-on, not slide decks.',
  },
] as const;

const STEPS = [
  { icon: BookOpen, title: 'Learn', text: 'Short sessions in plain English, each with one hand-picked YouTube video.' },
  { icon: ClipboardCheck, title: 'Test', text: 'Quick practice questions as you go, then a final quiz for the topic.' },
  { icon: Trophy, title: 'Level up', text: 'Earn XP, keep your streak and climb from Beginner to AI Pro.' },
] as const;

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* nav */}
      <header className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-20 sm:py-6">
        <Link href="/" aria-label="AI Zero to Hero — home">
          <Logo size={40} />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          <a href="#trail" className="text-base font-medium hover:underline">The trail</a>
          <a href="#why" className="text-base font-medium hover:underline">Curriculum</a>
          <Link href="/leaderboard" className="text-base font-medium hover:underline">Leaderboard</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shadow-hard-sm')}>
            Log in
          </Link>
          <Link href="/login?mode=signup" className={cn(buttonVariants({ variant: 'pink', size: 'sm' }), 'hidden shadow-hard-sm sm:inline-flex')}>
            Start free
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-16 pt-6 sm:px-20 sm:pb-[72px] lg:grid-cols-[1fr_560px] lg:gap-12">
        <div className="flex flex-col gap-6">
          <p className="hand text-[26px] text-pink sm:text-[30px]">hi! i’m Bolt — i’ll walk this trail with you</p>
          <h1 className="font-display-black text-[56px] leading-[0.98] sm:text-[88px] lg:text-[92px]">
            Learn AI from <span className="text-pink">Zero to Pro</span>
          </h1>
          <p className="max-w-[520px] text-xl leading-[1.5] text-soft sm:text-[21px]">Built for data analysts. No jargon. Just results.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login?mode=signup" className={buttonVariants({ variant: 'pink', size: 'lg' })}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <a href="#trail" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              See the trail
            </a>
          </div>
          <p className="text-[15px] font-medium text-soft">{TOTALS.topics} topics · {TOTALS.sessions} short sessions · {TOTALS.questions} quiz questions</p>
        </div>

        <div className="relative mx-auto h-[500px] w-full max-w-[560px] overflow-hidden rounded-3xl border-[3px] border-ink bg-pink-soft shadow-hard-xl sm:h-[580px]">
          <svg aria-hidden className="absolute bottom-6 left-0 w-full" viewBox="0 0 560 120" fill="none">
            <path d="M-10 90 C 120 30, 220 110, 330 60 S 500 20, 570 70" stroke="rgb(var(--ink))" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 12" />
          </svg>
          <span aria-hidden className="absolute right-10 top-10 size-[120px] rounded-full border-[3px] border-ink bg-yellow" />
          <span className="absolute left-6 top-10 flex rotate-[4deg] items-center gap-2 rounded-full border-[2.5px] border-ink bg-card px-4 py-2.5 text-[15px] font-bold shadow-hard-sm">
            <Flag size={18} className="text-pink" aria-hidden /> Level 1 · What is AI?
          </span>
          <div className="absolute inset-x-0 bottom-14 flex justify-center">
            <SittingSprite height={430} />
          </div>
          <span className="hand absolute bottom-3 left-6 -rotate-3 text-[26px] text-pink-deep">psst… quizzes unlock the next stop</span>
        </div>
      </section>

      {/* trail */}
      <section id="trail" className="border-y-2 border-ink bg-paper2 px-5 py-16 sm:px-20 sm:py-[72px]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-7">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <p className="hand text-[28px] text-pink">the whole journey, at a glance</p>
            <h2 className="font-display-black max-w-[900px] text-[38px] leading-[1.1] sm:text-5xl">{TOTALS.topics} stops from curious to confident</h2>
          </div>
          <TrailTeaser names={curriculum.map((t) => t.title)} />
        </div>
      </section>

      {/* features */}
      <section id="why" className="mx-auto flex max-w-[1440px] flex-col items-center gap-11 px-5 pb-10 pt-20 sm:px-20 sm:pt-[88px]">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <p className="hand text-[28px] text-pink">why it works</p>
          <h2 className="font-display-black max-w-[900px] text-[38px] leading-[1.1] sm:text-5xl">Learn a little, prove it, move on</h2>
        </div>
        <ul className="grid w-full gap-7 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, tone, title, text }) => (
            <li key={title} className="flex flex-col gap-4 rounded-card border-[2.5px] border-ink bg-card p-[30px] shadow-hard-lg">
              <span className={cn('flex size-[60px] items-center justify-center rounded-full border-[2.5px] border-ink', tone)}>
                <Icon size={28} strokeWidth={2.25} aria-hidden />
              </span>
              <h3 className="font-display-bold text-[28px] leading-tight">{title}</h3>
              <p className="text-[17px] leading-[1.55] text-soft">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* how it works */}
      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-11 px-5 pb-28 pt-[72px] sm:px-20 sm:pb-[190px]">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <p className="hand text-[28px] text-pink">how it works</p>
          <h2 className="font-display-black max-w-[900px] text-[38px] leading-[1.1] sm:text-5xl">Three steps. Repeat for every topic.</h2>
        </div>
        <ol className="grid w-full gap-7 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex flex-col gap-3.5">
              <div className="flex items-center gap-3.5">
                <span className="flex size-[52px] items-center justify-center rounded-full bg-ink font-display-black text-[26px] text-paper">{i + 1}</span>
                <Icon size={28} className="text-pink" aria-hidden />
              </div>
              <h3 className="font-display-bold text-[30px] leading-tight">{title}</h3>
              <p className="text-[17px] leading-[1.55] text-soft">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* call to action — a robot peeks over the top edge */}
      <section className="relative border-y-2 border-ink bg-pink px-5 pb-[76px] pt-[84px] sm:px-20">
        <div aria-hidden className="pointer-events-none absolute -top-[150px] right-[6%] hidden sm:block">
          <SittingSprite height={210} />
        </div>
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-6 text-center">
          <h2 className="font-display-black text-[40px] leading-[1.05] text-card sm:text-[60px]">Your first AI win is 10 minutes away</h2>
          <Link href="/login?mode=signup" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-8 py-[18px] text-[19px]')}>
            Start for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="relative bg-ink px-5 py-9 text-paper sm:px-20">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 md:flex-row">
          <span className="inline-flex items-center gap-2.5">
            <LogoMark size={36} />
            <span className="font-display-black text-[20px]">AI Zero to Hero</span>
          </span>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-7 text-[15px] font-medium">
            <a href="#trail">The trail</a>
            <Link href="/leaderboard">Leaderboard</Link>
            <a href="#why">Curriculum</a>
            <Link href="/login">Log in</Link>
          </nav>
          <p className="text-sm text-cream">© 2026 AI Zero to Hero. Made for analysts.</p>
        </div>
      </footer>
    </div>
  );
}
