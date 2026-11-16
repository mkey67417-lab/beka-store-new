import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, XCircle, User, Phone, Mail, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { AdminLoading, AdminNotice } from '@/components/admin/AdminPaymentMethods';
import { useAsyncData } from '@/hooks/useAsyncData';
import { describeAuthError } from '@/lib/authErrors';
import { formatPrice } from '@/lib/format';
import { fetchReceiptUrl, fetchTopUpsWithUsers, reviewTopUp } from '@/lib/topups';
import { TOP_UP_METHOD_LABELS, TOP_UP_STATUS_LABELS, TOP_UP_STATUS_STYLES, formatDateTime } from '@/lib/wallet';
import type { TopUpWithUser } from '@/types';

export default function AdminTopUps() {
  const { data, error, reload } = useAsyncData(fetchTopUpsWithUsers);

  if (error) return <AdminNotice text="تعذر تحميل طلبات الشحن، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-400">لا توجد طلبات شحن بعد</p>;

  const pending = data.filter((t) => t.status === 'pending');
  const reviewed = data.filter((t) => t.status !== 'pending');

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-glow-pulse" />
            <h3 className="text-sm font-bold text-zinc-300">بانتظار المراجعة ({pending.length})</h3>
          </div>
          <ul className="flex flex-col gap-4">
            {pending.map((item) => (
              <TopUpRow key={item.id} item={item} onReviewed={reload} />
            ))}
          </ul>
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-500">تمت مراجعتها ({reviewed.length})</h3>
          <ul className="flex flex-col gap-4">
            {reviewed.map((item) => (
              <TopUpRow key={item.id} item={item} onReviewed={reload} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TopUpRow({ item, onReviewed }: { item: TopUpWithUser; onReviewed: () => void }) {
  const [busy, setBusy] = useState<'approve' | 'reject' | 'receipt' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const isPending = item.status === 'pending';

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
    if (receiptUrl) {
      window.open(receiptUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setBusy('receipt');
    setMessage(null);
    try {
      const url = await fetchReceiptUrl(item.receiptPath);
      setReceiptUrl(url);
      setShowReceipt(true);
    } catch (err) {
      setMessage(describeAuthError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700">
      {/* Top row: amount + status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span dir="ltr" className="text-xl font-extrabold text-zinc-50">{formatPrice(item.amount)}</span>
          <span className="text-xs text-zinc-400">
            {TOP_UP_METHOD_LABELS[item.method]} · رقم العملية <span dir="ltr" className="font-semibold text-zinc-300">{item.transactionNumber}</span>
          </span>
          <span className="text-xs text-zinc-500">{formatDateTime(item.createdAt)}</span>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${TOP_UP_STATUS_STYLES[item.status]}`}>
          {TOP_UP_STATUS_LABELS[item.status]}
        </span>
      </div>

      {/* User info */}
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 sm:grid-cols-3">
        <InfoCell icon={User} label="الاسم" value={item.userName ?? '—'} />
        <InfoCell icon={Phone} label="الهاتف" value={item.userPhone ?? '—'} ltr />
        <InfoCell icon={Mail} label="البريد" value={item.userEmail ?? '—'} ltr />
      </div>

      {/* Receipt toggle */}
      <button
        type="button"
        onClick={() => void handleOpenReceipt()}
        disabled={busy !== null}
        className="flex items-center justify-between gap-2 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-brand-500 hover:text-brand-300 disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          صورة الإشعار
        </span>
        <span className="flex items-center gap-2">
          {busy === 'receipt' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
          {showReceipt ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {showReceipt && receiptUrl && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <img
            src={receiptUrl}
            alt="إشعار الشحن"
            className="max-h-96 w-full object-contain bg-zinc-950"
          />
        </div>
      )}

      {message && <p role="alert" className="text-sm text-red-400">{message}</p>}

      {/* Action buttons */}
      {isPending && (
        <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
          <button
            type="button"
            onClick={() => void handleReview(true)}
            disabled={busy !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            موافقة — شحن الرصيد
          </button>
          <button
            type="button"
            onClick={() => void handleReview(false)}
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/50 px-4 py-2.5 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {busy === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            رفض
          </button>
        </div>
      )}
    </li>
  );
}

function InfoCell({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: typeof User;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
      <span className="text-zinc-500">{label}:</span>
      <span dir={ltr ? 'ltr' : undefined} className="truncate font-semibold text-zinc-300">{value}</span>
    </div>
  );
}
