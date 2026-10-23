'use client';
import { Button } from '@/components/ui/button';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <p className="hand text-3xl text-pink">oops — the duck tripped</p>
      <h1 className="font-display-black text-4xl">Something went wrong</h1>
      <p className="text-soft">{error.message}</p>
      <div>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
