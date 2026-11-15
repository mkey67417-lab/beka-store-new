import { useEffect, useState } from 'react';
import { CalendarClock, ClipboardList, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { navigateTo } from '@/hooks/useHashRoute';
import { ACCOUNT_ROUTE } from '@/lib/config';
import { formatPrice } from '@/lib/format';
import { fetchOrders, type StoreOrder } from '@/lib/orders';
import { formatDateTime } from '@/lib/wallet';

const ORDER_STATUS: Record<string, { label: string; style: string }> = {
  pending: { label: 'قيد المراجعة', style: 'bg-amber-500/15 text-amber-300 ring-amber-500/30' },
  completed: { label: 'تم التنفيذ', style: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30' },
  cancelled: { label: 'ملغي', style: 'bg-red-500/15 text-red-300 ring-red-500/30' },
};

export default function OrdersPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageShell><p className="text-sm text-zinc-400">جاري تحميل حسابك...</p></PageShell>;

  return (
    <PageShell>
      <h1 className="text-2xl font-extrabold text-zinc-50 sm:text-3xl">طلباتي</h1>
      {user ? <OrderList /> : <SignInPrompt />}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">{children}</div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center animate-fade-up">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30">
        <ClipboardList className="h-7 w-7" />
      </span>
      <p className="text-sm leading-relaxed text-zinc-300">
        سجل دخولك عشان تشوف كل طلباتك في مكان واحد. لو طلبت كضيف، الطلب وصلنا وهنتواصل معاك عبر واتساب.
      </p>
      <button
        type="button"
        onClick={() => navigateTo(ACCOUNT_ROUTE)}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-500"
      >
        <LogIn className="h-4 w-4" />
        سجل دخولك
      </button>
    </div>
  );
}

function OrderList() {
  const [orders, setOrders] = useState<StoreOrder[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return <p role="alert" className="text-sm text-red-400">تعذر تحميل طلباتك، تأكد من الاتصال وحاول مرة أخرى.</p>;
  }

  if (orders === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        جاري تحميل طلباتك...
      </p>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-400">
        لسه ما عندكش طلبات. اختار لعبتك واطلب أول شحنة!
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => {
        const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
        return (
          <li
            key={order.id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-zinc-50">{order.gameName}</span>
                <span className="text-sm text-zinc-400">{order.packageLabel}</span>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.style}`}>
                {status.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4 text-sm">
              <span dir="ltr" className="font-bold text-brand-300">{formatPrice(order.amount)}</span>
              <span className="text-zinc-400">
                الآيدي: <span dir="ltr" className="text-zinc-200">{order.playerId}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
