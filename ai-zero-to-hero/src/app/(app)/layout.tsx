// Everything behind login depends on the signed-in user, so it is rendered per request.
export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
