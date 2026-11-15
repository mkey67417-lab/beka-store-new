import { supabase } from '@/lib/supabase';
import type { PaymentMethod } from '@/types';

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name_ar, account_label_ar, account_value, instructions_ar, sort_order, is_active')
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected response');
  return data as PaymentMethod[];
}

export async function updatePaymentMethod(
  id: string,
  changes: { account_value: string; is_active: boolean }
): Promise<void> {
  const { error } = await supabase.from('payment_methods').update(changes).eq('id', id);
  if (error) throw new Error(error.message);
}
