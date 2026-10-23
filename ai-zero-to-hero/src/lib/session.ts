import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { DashboardTopic, Profile } from '@/lib/types';

/** One Supabase client per request. */
export const getSupabase = cache(() => createClient());

export const getUser = cache(async () => {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  if (!user) redirect('/login');
  return user;
});

export const getProfile = cache(async (): Promise<Profile> => {
  const user = await getUser();
  const { data, error } = await getSupabase()
    .from('users_profile')
    .select('id, name, xp, streak, rank')
    .eq('id', user.id)
    .single();
  if (error || !data) {
    throw new Error('We could not load your profile. Did the migration in supabase/migrations run on this project?');
  }
  return data as Profile;
});

export const getDashboardTopics = cache(async (): Promise<DashboardTopic[]> => {
  await getUser();
  const { data, error } = await getSupabase().rpc('get_dashboard');
  if (error) throw new Error(`Could not load your learning path: ${error.message}`);
  return (data ?? []) as DashboardTopic[];
});
