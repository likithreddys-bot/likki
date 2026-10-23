import { Logo } from './Logo';

/** Shown instead of a crash when Supabase env vars are missing. */
export function SetupNotice() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-5 px-6 py-16">
      <Logo />
      <h1 className="font-display-black text-4xl">Almost there — connect Supabase</h1>
      <p className="text-lg text-soft">
        The app needs your Supabase project URL and anon key. Copy <code className="rounded bg-paper2 px-1.5 py-0.5">.env.example</code> to{' '}
        <code className="rounded bg-paper2 px-1.5 py-0.5">.env.local</code>, fill in the two values, and restart{' '}
        <code className="rounded bg-paper2 px-1.5 py-0.5">npm run dev</code>.
      </p>
      <p className="text-soft">Then run the SQL in <code className="rounded bg-paper2 px-1.5 py-0.5">supabase/migrations</code> and <code className="rounded bg-paper2 px-1.5 py-0.5">supabase/seed.sql</code>. The README has the full steps.</p>
    </main>
  );
}
