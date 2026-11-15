import { useState } from 'react';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminPaymentMethods from '@/components/admin/AdminPaymentMethods';
import AdminTopUps from '@/components/admin/AdminTopUps';
import AdminUsers from '@/components/admin/AdminUsers';
import SignInPanel from '@/components/wallet/SignInPanel';
import StatusScreen from '@/components/StatusScreen';
import { useAuth } from '@/hooks/useAuth';
import { navigateTo } from '@/hooks/useHashRoute';

type Tab = 'topups' | 'payments' | 'orders' | 'users';

const TABS: { id: Tab; label: string }[] = [
  { id: 'topups', label: 'طلبات الشحن' },
  { id: 'payments', label: 'أرقام الدفع' },
  { id: 'orders', label: 'الطلبات' },
  { id: 'users', label: 'المستخدمون' },
];

const TAB_CONTENT: Record<Tab, () => React.ReactNode> = {
  topups: () => <AdminTopUps />,
  payments: () => <AdminPaymentMethods />,
  orders: () => <AdminOrders />,
  users: () => <AdminUsers />,
};

export default function AdminPage() {
  const { user, isOwner, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('topups');

  if (isLoading) return <StatusScreen title="جاري التحقق من الصلاحيات..." loading />;
  if (!user) return <SignInPanel />;
  if (!isOwner) {
    return (
      <StatusScreen
        title="هذه الصفحة غير متاحة"
        description="ليست لديك صلاحية الوصول إلى هذه الصفحة."
        actionLabel="العودة إلى الرئيسية"
        onAction={() => navigateTo('/')}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold text-brand-300">لوحة الإدارة</p>
        <h1 className="text-2xl font-extrabold text-zinc-50 sm:text-3xl">بيكا ستور</h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-2 overflow-x-auto border-b border-zinc-800">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
                tab === item.id
                  ? 'border-brand-500 text-brand-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {TAB_CONTENT[tab]()}
      </div>
    </div>
  );
}
