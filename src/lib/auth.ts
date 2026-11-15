import { supabase } from '@/lib/supabase';
import { ACCOUNT_ROUTE } from '@/lib/config';
import { toE164 } from '@/lib/phone';

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}${window.location.pathname}#${ACCOUNT_ROUTE}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
}

export async function sendPhoneCode(localPhone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone: toE164(localPhone) });
  if (error) throw error;
}

export async function verifyPhoneCode(localPhone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    phone: toE164(localPhone),
    token,
    type: 'sms',
  });
  if (error) throw error;
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, name: string): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
