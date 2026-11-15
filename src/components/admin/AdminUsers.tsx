import { AdminLoading, AdminNotice } from '@/components/admin/AdminPaymentMethods';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchAllProfiles } from '@/lib/profiles';
import { formatPrice } from '@/lib/format';

export default function AdminUsers() {
  const { data, error, reload } = useAsyncData(fetchAllProfiles);

  if (error) return <AdminNotice text="تعذر تحميل المستخدمين، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;
  if (data.length === 0) return <p className="py-8 text-center text-sm text-zinc-400">لا يوجد مستخدمون بعد</p>;

  return (
    <ul className="flex flex-col gap-3">
      {data.map((user) => (
        <li key={user.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-bold text-zinc-50">{user.name?.trim() || 'بدون اسم'}</span>
            <span dir="ltr" className="truncate text-start text-xs text-zinc-400">{user.phone ?? user.email ?? '—'}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span dir="ltr" className="font-bold text-brand-300">{formatPrice(user.balance)}</span>
            <span className="text-zinc-400">{user.points.toLocaleString('en-US')} نقطة</span>
            {user.role === 'owner' && (
              <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-bold text-brand-300 ring-1 ring-brand-500/30">مالك</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
