'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { safeNext } from '@/lib/redirect';

type Mode = 'login' | 'signup';


function Field({
  id, label, icon, ...input
}: { id: string; label: string; icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="flex h-[46px] items-center gap-2.5 rounded-btn border-2 border-ink bg-paper px-3.5 focus-within:ring-[3px] focus-within:ring-pink/40">
        <span className="text-soft" aria-hidden>
          {icon}
        </span>
        <input id={id} className="h-full w-full bg-transparent text-base outline-none placeholder:text-soft" {...input} />
      </div>
    </div>
  );
}

export function AuthForm({ next, initialMode = 'login' }: { next?: string; initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.replace(safeNext(next));
        router.refresh();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (err) throw err;
        if (data.session) {
          router.replace(safeNext(next));
          router.refresh();
        } else {
          setInfo('Almost there — check your inbox and click the confirmation link, then log in.');
          setMode('login');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        msg === 'Failed to fetch'
          ? 'Can’t reach the server. Check your connection and the Supabase URL in .env.local.'
          : msg || 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  const seg = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => {
        setMode(m);
        setError(null);
        setInfo(null);
      }}
      className={cn(
        'flex-1 rounded-[7px] border-2 py-2.5 text-[15px] font-bold transition-colors',
        mode === m ? 'border-ink bg-pink text-card' : 'border-transparent text-soft hover:text-ink',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display-black text-[38px] leading-tight">{mode === 'login' ? 'Welcome back' : 'Join the trail'}</h1>
        <p className="mt-1.5 text-base text-soft">
          {mode === 'login' ? 'Log in to pick up where you left the trail.' : 'Free, and no coding required.'}
        </p>
      </div>

      <div role="tablist" aria-label="Log in or sign up" className="flex gap-1 rounded-[10px] border-2 border-ink bg-paper2 p-1">
        {seg('login', 'Log in')}
        {seg('signup', 'Sign up')}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {mode === 'signup' && (
          <Field id="name" label="Name" icon={<User size={18} />} type="text" autoComplete="name" placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Field id="email" label="Email" icon={<Mail size={18} />} type="email" autoComplete="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="relative">
          <Field
            id="password"
            label="Password"
            icon={<Lock size={18} />}
            type={showPw ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute bottom-0 right-3 flex h-[46px] items-center text-soft hover:text-ink"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div aria-live="polite" className="min-h-0">
          {error && <p className="rounded-btn border-2 border-red bg-red/10 px-3 py-2 text-sm font-medium text-red">{error}</p>}
          {info && <p className="rounded-btn border-2 border-green bg-green/10 px-3 py-2 text-sm font-medium text-green">{info}</p>}
        </div>

        <Button type="submit" size="md" className="w-full py-[15px] text-[17px]" disabled={loading}>
          {loading ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create my account'}
          {!loading && <ArrowRight size={18} />}
        </Button>
      </form>

      <p className="text-center text-[15px] text-soft">
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <button type="button" className="font-bold text-pink-deep underline-offset-2 hover:underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? 'Create a free account' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
