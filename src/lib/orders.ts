import { supabase } from '@/lib/supabase';
import type { OrderStatus, StoreOrder } from '@/types';

export type { StoreOrder };

export const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const RECEIPT_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export interface OrderInput {
  customerName: string;
  gameId: string;
  packageId: string;
  playerId: string;
  whatsapp: string;
  paymentMethodId: string;
  payerAccount: string;
  receipt: File;
}

export interface SubmitOrderResult {
  receiptSaved: boolean;
}

interface OrderRow {
  id: string;
  customer_name: string | null;
  whatsapp: string;
  player_id: string;
  amount_sdg: number;
  payer_account: string | null;
  receipt_path: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  user_id: string | null;
  game: { name_ar: string; name_en: string } | null;
  package: { label_ar: string } | null;
  payment_method: { name_ar: string } | null;
  user: { name: string | null; phone: string | null; email: string | null } | null;
}

export function normalizePlayerId(value: string): string {
  return value.trim();
}

export function normalizeWhatsapp(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export function normalizePayerAccount(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export function isValidPlayerId(value: string): boolean {
  return value.length >= 3 && value.length <= 50;
}

export function isValidWhatsapp(value: string): boolean {
  return /^\+?[0-9]{7,15}$/.test(value);
}

export function isValidPayerAccount(value: string): boolean {
  return /^\+?[0-9]{3,30}$/.test(value);
}

export function validateReceipt(file: File): string | null {
  if (!RECEIPT_EXTENSIONS[file.type]) {
    return 'الملف يجب أن يكون صورة بصيغة JPG أو PNG أو WebP';
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت';
  }
  return null;
}

export async function uploadReceipt(receipt: File): Promise<string | null> {
  const extension = RECEIPT_EXTENSIONS[receipt.type];
  if (!extension) return null;

  const receiptPath = `${crypto.randomUUID()}.${extension}`;
  try {
    const { error } = await supabase.storage.from('receipts').upload(receiptPath, receipt, {
      contentType: receipt.type,
      upsert: false,
    });
    return error ? null : receiptPath;
  } catch {
    return null;
  }
}

export async function submitOrder(input: OrderInput): Promise<SubmitOrderResult> {
  const receiptPath = await uploadReceipt(input.receipt);

  const { error } = await supabase.from('orders').insert({
    customer_name: input.customerName,
    game_id: input.gameId,
    package_id: input.packageId,
    player_id: input.playerId,
    whatsapp: input.whatsapp,
    payment_method_id: input.paymentMethodId,
    payer_account: input.payerAccount,
    receipt_path: receiptPath,
  });
  if (error) throw new Error(error.message);

  return { receiptSaved: receiptPath !== null };
}

export async function fetchReceiptUrl(orderId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('receipt_path')
      .eq('id', orderId)
      .single();

    if (error || !data?.receipt_path) return null;

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(data.receipt_path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error fetching receipt URL:', err);
    return null;
  }
}

export async function reviewOrder(orderId: string, status: OrderStatus, _reviewedBy?: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ 
      status, 
      reviewed_at: new Date().toISOString() 
    })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

export async function fetchOrders(): Promise<StoreOrder[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      game:games(name_ar, name_en),
      package:game_packages(label_ar),
      payment_method:payment_methods(name_ar),
      user:users(name, phone, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  return (data || []).map((row: OrderRow) => ({
    id: row.id,
    customerName: row.customer_name || '',
    whatsapp: row.whatsapp,
    playerId: row.player_id,
    amountSdg: row.amount_sdg,
    payerAccount: row.payer_account || '',
    receiptPath: row.receipt_path,
    status: row.status as OrderStatus,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    userId: row.user_id,
    game: row.game,
    package: row.package,
    paymentMethod: row.payment_method,
    user: row.user,
  }));
}
