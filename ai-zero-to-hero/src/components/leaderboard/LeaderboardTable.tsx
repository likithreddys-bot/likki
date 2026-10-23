'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { LeaderboardRow } from '@/lib/types';
import { initials } from '@/lib/initials';

const LIMIT = 50;
const COLUMNS = 'user_id, name, xp, topics_completed, rank, badge';
const AVATAR_TONES = ['bg-orange', 'bg-green text-card', 'bg-pink text-card', 'bg-yellow'] as const;
const MEDAL: Record<number, string> = { 1: 'bg-gold', 2: 'bg-silver', 3: 'bg-bronze' };
const BADGE_TONE: Record<string, string> = {
  'AI Pro': 'bg-pink text-card',
  Builder: 'bg-orange',
  Explorer: 'bg-yellow',
  Beginner: 'bg-cream',
};

function avatarTone(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

const GRID = 'grid grid-cols-[48px_44px_minmax(0,1fr)_84px] items-center gap-x-3 sm:grid-cols-[90px_70px_minmax(0,1fr)_150px_170px_180px] sm:gap-x-0';

type Live = 'connecting' | 'live' | 'offline';

/** The ranking. Subscribes to users_profile changes and re-reads the leaderboard view when XP moves. */
export function LeaderboardTable({
  initialRows,
  initialMe,
  meId,
  totalTopics,
  subscribe = true,
}: {
  initialRows: LeaderboardRow[];
  initialMe: LeaderboardRow | null;
  meId: string;
  /** How many topics exist, for the "3 / 10" column. */
  totalTopics: number;
  /** Turn off the realtime subscription (used by the design preview, which has no database). */
  subscribe?: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [me, setMe] = useState(initialMe);
  const [live, setLive] = useState<Live>(subscribe ? 'connecting' : 'live');
  const [flash, setFlash] = useState<Set<string>>(new Set());
  const prevXp = useRef(new Map(initialRows.map((r) => [r.user_id, r.xp])));

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const [top, mine] = await Promise.all([
      supabase.from('leaderboard').select(COLUMNS).order('xp', { ascending: false }).order('name').limit(LIMIT),
      supabase.from('leaderboard').select(COLUMNS).eq('user_id', meId).maybeSingle(),
    ]);
    if (top.error || !top.data) return;
    const next = top.data as LeaderboardRow[];
    const changed = new Set<string>();
    for (const r of next) if (prevXp.current.has(r.user_id) && prevXp.current.get(r.user_id) !== r.xp) changed.add(r.user_id);
    prevXp.current = new Map(next.map((r) => [r.user_id, r.xp]));
    setRows(next);
    setMe((mine.data as LeaderboardRow | null) ?? null);
    if (changed.size) {
      setFlash(changed);
      setTimeout(() => setFlash(new Set()), 2200);
    }
  }, [meId]);

  useEffect(() => {
    if (!subscribe) return;
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const channel = supabase
      .channel('leaderboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users_profile' }, () => {
        clearTimeout(timer);
        timer = setTimeout(refetch, 250); // several changes can land together
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLive('live');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setLive('offline');
      });
    return () => {
      clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [refetch, subscribe]);

  const meInTop = rows.some((r) => r.user_id === meId);

  const renderRow = (r: LeaderboardRow, isMe: boolean) => {
    const medal = MEDAL[r.rank];
    return (
      <li
        key={r.user_id}
        aria-current={isMe ? 'true' : undefined}
        className={cn(
          GRID,
          'border-b border-cream px-4 py-3.5 transition-colors sm:px-7',
          isMe && 'border-[3px] border-pink bg-pink-soft py-4',
          flash.has(r.user_id) && 'bg-yellow/40',
          !isMe && r.rank === 1 && 'bg-paper',
        )}
      >
        <span>
          {medal ? (
            <span
              className={cn('flex size-10 items-center justify-center rounded-full border-[2.5px] border-ink shadow-hard-sm font-display-black text-xl', medal)}
              aria-label={`Rank ${r.rank}`}
            >
              {r.rank}
            </span>
          ) : (
            <span className="font-display-bold pl-1 text-[22px] text-soft" aria-label={`Rank ${r.rank}`}>
              {r.rank}
            </span>
          )}
        </span>
        <span
          className={cn('flex size-11 items-center justify-center rounded-full border-[2.5px] border-ink text-[15px] font-bold', isMe ? 'bg-pink text-card' : avatarTone(r.user_id))}
          aria-hidden
        >
          {initials(r.name)}
        </span>
        <span className="flex min-w-0 items-center gap-2.5">
          <span className={cn('truncate text-lg', r.rank <= 3 || isMe ? 'font-bold' : 'font-semibold')}>{r.name}</span>
          {isMe && <span className="rounded-full border-2 border-ink bg-pink px-2.5 py-[3px] text-[11px] font-bold tracking-[0.08em] text-card">YOU</span>}
        </span>
        <span className="font-display-bold text-xl tabular-nums" style={{ letterSpacing: 0 }}>
          {r.xp} XP
        </span>
        <span className="hidden text-base font-medium sm:block">{r.topics_completed} / {totalTopics}</span>
        <span className="hidden sm:block">
          <span className={cn('inline-block rounded-full border-2 border-ink px-3.5 py-1.5 text-[13px] font-bold', BADGE_TONE[r.badge] ?? 'bg-cream')}>{r.badge}</span>
        </span>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <span className="inline-flex items-center gap-2.5 rounded-full border-[2.5px] border-ink bg-card px-[18px] py-2.5 text-sm font-semibold shadow-hard-sm" role="status">
          <span className={cn('size-3 rounded-full border-2 border-ink', live === 'live' ? 'bg-green' : live === 'connecting' ? 'bg-yellow' : 'bg-red')} aria-hidden />
          {live === 'live' && 'Live · updates when anyone’s XP changes'}
          {live === 'connecting' && 'Connecting to live updates…'}
          {live === 'offline' && 'Live updates paused — refresh to reconnect'}
        </span>
      </div>

      <div className="overflow-hidden rounded-card border-[3px] border-ink bg-card shadow-hard-lg">
        <div className={cn(GRID, 'bg-paper2 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-soft sm:px-7')} aria-hidden>
          <span>Rank</span>
          <span />
          <span>Name</span>
          <span>XP</span>
          <span className="hidden sm:block">Topics done</span>
          <span className="hidden sm:block">Badge</span>
        </div>
        {rows.length === 0 ? (
          <p className="px-7 py-10 text-center text-soft">Nobody is on the board yet — pass a final quiz to be the first.</p>
        ) : (
          <ol aria-label="Leaderboard, highest XP first">
            {rows.map((r) => renderRow(r, r.user_id === meId))}
            {!meInTop && me && (
              <>
                <li className={cn(GRID, 'border-b border-cream px-4 py-2.5 text-soft sm:px-7')} aria-hidden>
                  <span className="pl-1 text-[22px] font-bold">···</span>
                  <span />
                  <span className="text-[15px] font-medium">more learners</span>
                </li>
                {renderRow(me, true)}
              </>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}
