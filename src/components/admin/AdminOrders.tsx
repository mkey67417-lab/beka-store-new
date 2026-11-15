import { AdminLoading, AdminNotice } from '@/components/admin/AdminPaymentMethods';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchOrders } from '@/lib/orders';
import { formatPrice } from '@/lib/format';
import { formatDateTime } from '@/lib/wallet';

export default function AdminOrders() {
  const { data, error, reload } = useAsyncData(fetchOrders);

  if (error) return <AdminNotice text="تعذر تحميل الطلبات، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-400">لا توجد طلبات بعد</p>;

  return (
    <ul className="flex flex-col gap-3">
      {data.map((order) => (
        <li key={order.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-bold text-zinc-50">
              {order.gameName} · {order.packageLabel}
            </span>
            <span dir="ltr" className="text-sm font-bold text-brand-300">{formatPrice(order.amount)}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
            <span>العميل: {order.customerName ?? '—'}</span>
            <span dir="ltr">واتساب: {order.whatsapp}</span>
            <span dir="ltr">الآيدي: {order.playerId}</span>
            <span>الدفع: {order.paymentName}</span>
            <span dir="ltr">حساب المحوّل: {order.payerAccount ?? '—'}</span>
          </div>
          <span className="text-xs text-zinc-500">{formatDateTime(order.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
