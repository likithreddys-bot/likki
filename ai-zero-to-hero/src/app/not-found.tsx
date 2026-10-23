import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col justify-center gap-4 px-6 py-16">
      <p className="hand text-3xl text-pink">hmm, this trail doesn’t go anywhere</p>
      <h1 className="font-display-black text-5xl">Page not found</h1>
      <div>
        <Link href="/dashboard" className={buttonVariants()}>
          Back to the trail
        </Link>
      </div>
    </main>
  );
}
