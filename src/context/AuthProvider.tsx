import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from '@/context/authContext';
import { supabase } from '@/lib/supabase';
import { fetchProfile } from '@/lib/profiles';
import type { UserProfile } from '@/types';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      setProfile(await fetchProfile(userId));
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        if (!active) return;
        setSession(nextSession);
        if (nextSession) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
        if (active) setIsLoading(false);
      })();
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user.id;
    if (userId) await loadProfile(userId);
  }, [session, loadProfile]);

  const user: User | null = session?.user ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isOwner: profile?.role === 'owner',
      refreshProfile,
    }),
    [session, user, profile, isLoading, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
