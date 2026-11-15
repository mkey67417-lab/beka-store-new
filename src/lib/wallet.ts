import type { TopUpMethodId, TopUpStatus } from '@/types';

export const TOP_UP_METHOD_LABELS: Record<TopUpMethodId, string> = {
  fawry: 'فوري',
  mycashi: 'ماي كاشي',
};

export const TOP_UP_STATUS_LABELS: Record<TopUpStatus, string> = {
  pending: 'قيد المراجعة',
  approved: 'تمت الموافقة',
  rejected: 'مرفوض',
};

export const TOP_UP_STATUS_STYLES: Record<TopUpStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-300 ring-red-500/30',
};

const dateFormatter = new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDateTime(value: string | null): string {
  return value ? dateFormatter.format(new Date(value)) : '—';
}
