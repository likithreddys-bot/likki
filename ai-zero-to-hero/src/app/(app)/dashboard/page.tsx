import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { getDashboardTopics, getProfile } from '@/lib/session';

export const metadata: Metadata = { title: 'Your Learning Path' };

export default async function DashboardPage() {
  const [profile, topics] = await Promise.all([getProfile(), getDashboardTopics()]);
  return <DashboardView profile={profile} topics={topics} />;
}
