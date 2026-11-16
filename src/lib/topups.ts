import { supabase } from '@/lib/supabase';
import { uploadReceipt } from '@/lib/orders';
import type { TopUpMethodId, TopUpRequest, TopUpStatus, TopUpWithUser } from '@/types';

export interface NewTopUp {
  amount: number;
  method: TopUpMethodId;
  transactionNumber: string;
  receipt: File;
}

interface TopUpRow {
  id: string;
  user_id: string;
  amount_sdg: number;
  method: TopUpMethodId;
  transaction_number: string;
  receipt_path: string;
  status: TopUpStatus;
  created_at: string;
}

interface TopUpWithUserRow extends TopUpRow {
  user: { name: string | null; phone: string | null; email: string | null } | null;
}

const TOP_UP_COLUMNS =
  'id, user_id, amount_sdg, method, transaction_number, receipt_path, status, created_at';

const TOP_UP_WITH_USER_COLUMNS =
  'id, user_id, amount_sdg, method, transaction_number, receipt_path, status, created_at, user:profiles(name, phone, email)';

function toTopUp(row: TopUpRow): TopUpRequest {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount_sdg,
    method: row.method,
    transactionNumber: row.transaction_number,
    receiptPath: row.receipt_path,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toTopUpWithUser(row: TopUpWithUserRow): TopUpWithUser {
  return {
    ...toTopUp(row),
    userName: row.user?.name ?? null,
    userPhone: row.user?.phone ?? null,
    userEmail: row.user?.email ?? null,
  };
}

export async function createTopUp(input: NewTopUp, userId: string): Promise<void> {
  const receiptPath = await uploadReceipt(input.receipt);
  if (!receiptPath) throw new Error('RECEIPT_UPLOAD_FAILED');

  const { error } = await supabase.from('topups').insert({
    user_id: userId,
    amount_sdg: input.amount,
    method: input.method,
    transaction_number: input.transactionNumber,
    receipt_path: receiptPath,
  });
  if (error) throw new Error(error.message);
}

export async function fetchTopUps(): Promise<TopUpRequest[]> {
  const { data, error } = await supabase
    .from('topups')
    .select(TOP_UP_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected response');
  return (data as unknown as TopUpRow[]).map(toTopUp);
}

export async function fetchTopUpsWithUsers(): Promise<TopUpWithUser[]> {
  const { data, error } = await supabase
    .from('topups')
    .select(TOP_UP_WITH_USER_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected response');
  return (data as unknown as TopUpWithUserRow[]).map(toTopUpWithUser);
}

export async function reviewTopUp(id: string, approve: boolean): Promise<void> {
  const { error } = await supabase.rpc('review_topup', { p_topup_id: id, p_approve: approve });
  if (error) throw new Error(error.message);
}

export async function fetchReceiptUrl(receiptPath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('receipts').createSignedUrl(receiptPath, 300);
  if (error || !data) throw new Error(error?.message ?? 'Receipt unavailable');
  return data.signedUrl;
}
