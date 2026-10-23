export type SupabaseEnv = { url: string; anonKey: string };

/** Only the project's origin matters: a pasted "…/rest/v1/" or trailing slash would break every auth call. */
export function normalizeSupabaseUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : null;
  } catch {
    return null;
  }
}

/** Returns null when the .env.local values are missing, so pages can show setup help instead of crashing. */
export function getSupabaseEnv(): SupabaseEnv | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!rawUrl || !anonKey || rawUrl.includes('YOUR-PROJECT') || anonKey.startsWith('YOUR-')) return null;
  const url = normalizeSupabaseUrl(rawUrl);
  return url ? { url, anonKey } : null;
}
