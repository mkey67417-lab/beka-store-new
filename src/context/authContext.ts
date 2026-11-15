import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { UserProfile } from '@/types';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isOwner: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
