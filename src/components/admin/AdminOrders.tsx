import { useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, XCircle, User, Phone, Mail, Receipt, ChevronDown, ChevronUp, Gamepad2, IdCard, Wallet } from 'lucide-react';
import { AdminLoading, AdminNotice } from '@/components/admin/AdminPaymentMethods';
import { useAsyncData } from '@/hooks/useAsyncData';
import { describeAuthError } from '@/lib/authErrors';
import { fetchOrders, reviewOrder, fetchReceiptUrl } from '@/lib/orders';
import { formatPrice } from '@/lib/format';
import { formatDateTime } from '@/lib/wallet';
import type { OrderStatus, StoreOrder } from '@/types';

const ORDER_STATUS_INFO: Record<OrderStatus, { label: string; style: string }> = {
  pending: { label: 'قيد المراجعة', style: 'bg-amber-500/15 text-amber-300 ring-amber-500/30' },
  completed: { label: 'تم التنفيذ', style: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  rejected: { label: 'مرفوض', style: 'bg-red-500/15 text-red-300 ring-red-500/30' },
};

export default function AdminOrders() {
  const { data, error, reload } = useAsyncData(fetchOrders);

  if (error) return <AdminNotice text="تعذر تحميل الطلبات، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-400">لا توجد طلبات بعد</p>;

  const pending = data.filter((o) => o.status === 'pending');
  const reviewed = data.filter((o) => o.status !== 'pending');

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-glow-pulse" />
            <h3 className="text-sm font-bold text-zinc-300">بانتظار التأكيد ({pending.length})</h3>
          </div>
          <ul className="flex flex-col gap-4">
            {pending.map((order) => (
              <OrderRow key={order.id} order={order} onReviewed={reload} />
            ))}
          </ul>
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-zinc-500">تمت مراجعتها ({reviewed.length})</h3>
          <ul className="flex flex-col gap-4">
            {reviewed.map((order) => (
              <OrderRow key={order.id} order={order} onReviewed={reload} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, onReviewed }: { order: StoreOrder; onReviewed: () => void }) {
  const [busy, setBusy] = useState<'confirm' | 'reject' | 'receipt' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const statusInfo = ORDER_STATUS_INFO[order.status] ?? ORDER_STATUS_INFO.pending;
  const isPending = order.status === 'pending';
  const hasWallet = order.userId !== null;

  async function handleReview(approve: boolean) {
    setBusy(approve ? 'confirm' : 'reject');
    setMessage(null);
    try {
      await reviewOrder(order.id, approve);
      onReviewed();
    } catch (err) {
      setMessage(describeAuthError(err));
      setBusy(null);
    }
  }

  async function handleOpenReceipt() {
    if (!order.receiptPath) return;
    if (receiptUrl) {
      setShowReceipt((v) => !v);
      return;
    }
    setBusy('receipt');
    setMessage(null);
    try {
      const url = await fetchReceiptUrl(order.receiptPath);
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
      {/* Header: game + status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4 text-brand-300" />
            <span className="text-base font-extrabold text-zinc-50">{order.gameName}</span>
          </div>
          <span className="text-sm text-zinc-400">{order.packageLabel}</span>
          <span className="text-xs text-zinc-500">{formatDateTime(order.createdAt)}</span>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusInfo.style}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between rounded-xl border border-brand-500/20 bg-brand-500/5 px-4 py-3">
        <span className="text-sm text-zinc-300">القيمة</span>
        <span dir="ltr" className="text-lg font-extrabold text-brand-300">{formatPrice(order.amount)}</span>
      </div>

      {/* Player details */}
      <div className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 sm:grid-cols-2">
        <InfoCell icon={IdCard} label="آيدي اللاعب" value={order.playerId} ltr />
        <InfoCell icon={User} label="العميل" value={order.customerName ?? '—'} />
        <InfoCell icon={Phone} label="واتساب" value={order.whatsapp} ltr />
        <InfoCell icon={Wallet} label="طريقة الدفع" value={order.paymentName} />
        {order.payerAccount && (
          <InfoCell icon={Wallet} label="حساب المحول" value={order.payerAccount} ltr />
        )}
        {hasWallet && (
          <InfoCell icon={User} label="المستخدم" value={order.userName ?? order.userPhone ?? order.userEmail ?? '—'} />
        )}
      </div>

      {/* Wallet deduction notice */}
      {isPending && hasWallet && (
        <p className="rounded-lg bg-brand-500/10 px-3 py-2 text-xs text-brand-300">
          عند التأكيد سيتم خصم {formatPrice(order.amount)} من محفظة العميل تلقائياً.
        </p>
      )}
      {isPending && !hasWallet && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          طلب ضيف — لا توجد محفظة للخصم. اضغط تأكيد بعد إتمام الشحن يدوياً.
        </p>
      )}

      {/* Receipt toggle */}
      {order.receiptPath && (
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
      )}

      {showReceipt && receiptUrl && (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <img
            src={receiptUrl}
            alt="إشعار الدفع"
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
            {busy === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            تأكيد إتمام الشحن
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
