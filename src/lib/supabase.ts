import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wacijpqtwcmrnurrjvlx.supabase.co',
  'Sb_publishable_4_CUQ7a_slWSwTwdiw25Ag_j9Vy4CIp',
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
