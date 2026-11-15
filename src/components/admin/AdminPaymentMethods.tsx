import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchPaymentMethods, updatePaymentMethod } from '@/lib/paymentMethods';
import { describeAuthError } from '@/lib/authErrors';
import type { PaymentMethod } from '@/types';

export default function AdminPaymentMethods() {
  const { data, error, reload } = useAsyncData(fetchPaymentMethods);

  if (error) return <AdminNotice text="تعذر تحميل طرق الدفع، حاول مرة أخرى." onRetry={reload} />;
  if (!data) return <AdminLoading />;

  return (
    <ul className="flex flex-col gap-4">
      {data.map((method) => (
        <PaymentMethodRow key={`${method.id}-${method.account_value}-${method.is_active}`} method={method} onSaved={reload} />
      ))}
    </ul>
  );
}

function PaymentMethodRow({ method, onSaved }: { method: PaymentMethod; onSaved: () => void }) {
  const [accountValue, setAccountValue] = useState(method.account_value);
  const [isActive, setIsActive] = useState(method.is_active);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isDirty = accountValue.trim() !== method.account_value || isActive !== method.is_active;

  async function handleSave() {
    const trimmed = accountValue.trim();
    if (!trimmed) {
      setMessage('ما ينفع الرقم يكون فاضي.');
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      await updatePaymentMethod(method.id, { account_value: trimmed, is_active: isActive });
      onSaved();
    } catch (err) {
      setMessage(describeAuthError(err));
      setIsSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <span className="text-base font-bold text-zinc-50">{method.name_ar}</span>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 accent-brand-500"
          />
          ظاهرة للعملاء
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-zinc-400">{method.account_label_ar}</span>
        <input
          value={accountValue}
          onChange={(event) => setAccountValue(event.target.value)}
          dir="ltr"
          inputMode="numeric"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
        />
      </label>
      {message && <p role="alert" className="text-sm text-red-400">{message}</p>}
      <button
        type="button"
        disabled={!isDirty || isSaving}
        onClick={() => void handleSave()}
        className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        احفظ التغييرات
      </button>
    </li>
  );
}

export function AdminLoading() {
  return (
    <p className="flex items-center gap-2 py-8 text-sm text-zinc-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      جاري التحميل...
    </p>
  );
}

export function AdminNotice({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-red-400">{text}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-sm font-bold text-brand-300 hover:text-brand-200">
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
