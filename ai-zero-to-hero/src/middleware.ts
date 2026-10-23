import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from '@/lib/supabase/env';

const PROTECTED = ['/dashboard', '/topics', '/leaderboard'];

/** Keeps the Supabase session fresh and gates the learning pages behind a login. */
export async function middleware(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next(); // pages show a setup notice

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }
  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return response;
}

/**
 * Only the pages that depend on who is signed in run this (it costs a round trip to Supabase).
 * The landing page, setup page, 404 and static files are served as-is, so they stay fast.
 */
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/topics/:path*', '/leaderboard/:path*'],
};
