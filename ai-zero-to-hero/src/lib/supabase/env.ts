export type SupabaseEnv = { url: string; anonKey: string };

/** Returns null when the .env.local values are missing, so pages can show setup help instead of crashing. */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes('YOUR-PROJECT') || anonKey.startsWith('YOUR-')) return null;
  return { url, anonKey };
}
