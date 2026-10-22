import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RoamingDuck } from '@/components/duck/RoamingDuck';

export const metadata: Metadata = {
  title: { default: 'AI Zero to Hero', template: '%s · AI Zero to Hero' },
  description: 'Learn AI from zero to pro. Built for data analysts. No jargon. Just results.',
};

export const viewport: Viewport = { themeColor: '#FBF3E7' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <RoamingDuck />
      </body>
    </html>
  );
}
