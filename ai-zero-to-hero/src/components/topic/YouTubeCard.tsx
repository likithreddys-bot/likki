import Image from 'next/image';
import { ExternalLink, Play } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Video } from '@/lib/types';

/** A reference video: thumbnail + title + a link out. Never embedded, never autoplays. */
export function YouTubeCard({ video }: { video: Video }) {
  const isSearch = video.url.includes('/results?');
  return (
    <div className="flex flex-col gap-5 rounded-card border-[2.5px] border-ink bg-card p-5 shadow-hard-md sm:flex-row sm:items-center sm:gap-6">
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${isSearch ? 'Search YouTube for' : 'Watch'} ${video.title}`}
        className="relative block aspect-video w-full shrink-0 overflow-hidden rounded-[10px] border-[2.5px] border-ink bg-yellow sm:w-[300px]"
      >
        {video.thumbnail ? (
          <Image src={video.thumbnail} alt="" fill unoptimized sizes="300px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(var(--pink-soft))_0,transparent_45%)]" aria-hidden />
        )}
        <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-ink bg-pink text-card shadow-hard-sm">
          <Play size={26} fill="currentColor" strokeWidth={2} className="ml-0.5" />
        </span>
      </a>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="eyebrow text-pink-deep">{isSearch ? 'Find a video · optional' : 'Reference video · optional'}</p>
        <h3 className="font-display-bold text-2xl leading-7">{video.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'py-[11px] shadow-hard-sm')}
          >
            {isSearch ? 'Search on YouTube' : 'Watch on YouTube'} <ExternalLink size={15} />
          </a>
          <span className="text-[13px] text-soft">Opens in a new tab. Nothing autoplays.</span>
        </div>
      </div>
    </div>
  );
}
