import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { AdminLoading, AdminNotice } from '@/components/admin/AdminPaymentMethods';
import { useAsyncData } from '@/hooks/useAsyncData';
import { describeAuthError } from '@/lib/authErrors';
import { formatPrice } from '@/lib/format';
import { fetchReceiptUrl, fetchTopUps, reviewTopUp } from '@/lib/topups';
import { TOP_UP_METHOD_LABELS, TOP_UP_STATUS_LABELS, TOP_UP_STATUS_STYLES, formatDateTime } from '@/lib/wallet';
import type { TopUpRequest } from '@/types';

export default function AdminTopUps() {
  const { data, error, reload } = useAsyncData(fetchTopUps);

  if (error) return <AdminNotice text="تعذر تحميل طلبات الشحن، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-400">لا توجد طلبات شحن بعد</p>;

  return (
    <ul className="flex flex-col gap-4">
      {data.map((item) => (
        <TopUpRow key={item.id} item={item} onReviewed={reload} />
      ))}
    </ul>
  );
}

function TopUpRow({ item, onReviewed }: { item: TopUpRequest; onReviewed: () => void }) {
  const [busy, setBusy] = useState<'approve' | 'reject' | 'receipt' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleReview(approve: boolean) {
    setBusy(approve ? 'approve' : 'reject');
    setMessage(null);
    try {
      await reviewTopUp(item.id, approve);
      onReviewed();
    } catch (err) {
      setMessage(describeAuthError(err));
      setBusy(null);
    }
  }

  async function handleOpenReceipt() {
    setBusy('receipt');
    setMessage(null);
    try {
      const url = await fetchReceiptUrl(item.receiptPath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setMessage(describeAuthError(err));
    } finally {
      setBusy(null);
    }
  }

  const isPending = item.status === 'pending';

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span dir="ltr" className="text-lg font-bold text-zinc-50">{formatPrice(item.amount)}</span>
          <span className="text-xs text-zinc-400">
            {TOP_UP_METHOD_LABELS[item.method]} · رقم العملية <span dir="ltr">{item.transactionNumber}</span>
          </span>
          <span className="text-xs text-zinc-500">{formatDateTime(item.createdAt)}</span>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${TOP_UP_STATUS_STYLES[item.status]}`}>
          {TOP_UP_STATUS_LABELS[item.status]}
        </span>
      </div>

      {message && <p role="alert" className="text-sm text-red-400">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleOpenReceipt()}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-300 disabled:opacity-50"
        >
          {busy === 'receipt' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          عرض الإشعار
        </button>
        {isPending && (
          <>
            <button
              type="button"
              onClick={() => void handleReview(true)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              موافقة
            </button>
            <button
              type="button"
              onClick={() => void handleReview(false)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/50 px-4 py-2 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              {busy === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              رفض
            </button>
          </>
        )}
      </div>
    </li>
  );
}
