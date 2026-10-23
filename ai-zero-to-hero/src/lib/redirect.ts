/** Only allow same-site relative redirects (blocks open redirects like //evil.com or https://evil.com). */
export function safeNext(next: string | undefined | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard';
}
