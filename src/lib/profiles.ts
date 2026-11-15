import { supabase } from '@/lib/supabase';
import type { UserProfile, UserRole } from '@/types';

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  balance: number;
  points: number;
}

const PROFILE_COLUMNS = 'id, name, email, phone, avatar_url, role, balance, points';

function toProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    role: row.role,
    balance: row.balance,
    points: row.points,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toProfile(data as ProfileRow) : null;
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected response');
  return (data as ProfileRow[]).map(toProfile);
}
