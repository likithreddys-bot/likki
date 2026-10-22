import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Email-confirmation links land here; we swap the code for a session and send the learner to their trail. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/dashboard`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
