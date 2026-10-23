import type { Metadata } from 'next';
import { SetupNotice } from '@/components/SetupNotice';

export const metadata: Metadata = { title: 'Set up Supabase' };

export default function SetupPage() {
  return <SetupNotice />;
}
