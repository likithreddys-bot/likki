import { describe, expect, it } from 'vitest';
import { normalizeSupabaseUrl } from '../src/lib/supabase/env';

describe('normalizeSupabaseUrl', () => {
  it('keeps a clean project URL', () => {
    expect(normalizeSupabaseUrl('https://abc.supabase.co')).toBe('https://abc.supabase.co');
  });
  it('strips a pasted /rest/v1/ path, trailing slash and spaces', () => {
    expect(normalizeSupabaseUrl('https://abc.supabase.co/rest/v1/')).toBe('https://abc.supabase.co');
    expect(normalizeSupabaseUrl('  https://abc.supabase.co/  ')).toBe('https://abc.supabase.co');
  });
  it('rejects things that are not URLs', () => {
    expect(normalizeSupabaseUrl('abc.supabase.co')).toBeNull();
    expect(normalizeSupabaseUrl('')).toBeNull();
  });
});
