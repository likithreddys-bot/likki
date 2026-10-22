import type { Metadata } from 'next';
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView';
import { getProfile, getSupabase } from '@/lib/session';
import type { LeaderboardRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Leaderboard' };

const COLUMNS = 'user_id, name, xp, topics_completed, rank, badge';

export default async function LeaderboardPage() {
  const profile = await getProfile();
  const supabase = getSupabase();
  const [top, mine] = await Promise.all([
    supabase.from('leaderboard').select(COLUMNS).order('xp', { ascending: false }).order('name').limit(50),
    supabase.from('leaderboard').select(COLUMNS).eq('user_id', profile.id).maybeSingle(),
  ]);
  if (top.error) throw new Error(`Could not load the leaderboard: ${top.error.message}`);
  return <LeaderboardView profile={profile} rows={(top.data ?? []) as LeaderboardRow[]} me={(mine.data as LeaderboardRow | null) ?? null} />;
}
