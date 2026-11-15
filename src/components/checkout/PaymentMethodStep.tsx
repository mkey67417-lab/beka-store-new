import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Wallet } from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentMethodStepProps {
  methods: PaymentMethod[];
  selectedId: string | null;
  onBack: () => void;
  onNext: (methodId: string) => void;
}

export default function PaymentMethodStep({ methods, selectedId, onBack, onNext }: PaymentMethodStepProps) {
  const [choice, setChoice] = useState<string | null>(selectedId ?? methods[0]?.id ?? null);

  if (methods.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-red-400">طرق الدفع مش متاحة دلوقتي، جرّب تاني بعد شوية.</p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          السابق
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-zinc-50">طريقة الدفع</h2>
        <p className="mt-1 text-sm text-zinc-400">اختار الطريقة اللي هتحوّل بيها المبلغ</p>
      </div>

      <div role="radiogroup" aria-label="طرق الدفع" className="flex flex-col gap-3">
        {methods.map((method) => {
          const isSelected = choice === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setChoice(method.id)}
              className={`flex items-center justify-between rounded-xl border p-4 text-start transition-all duration-200 ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/10 shadow-lg shadow-brand-600/10'
                  : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-brand-600 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <Wallet className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold text-zinc-50">{method.name_ar}</span>
                  <span className="text-xs text-zinc-400">
                    {method.account_label_ar}: <span dir="ltr" className="text-brand-300">{method.account_value}</span>
                  </span>
                </span>
              </span>
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                  isSelected ? 'border-brand-500 bg-brand-500' : 'border-zinc-700'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 stroke-[3] text-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-semibold text-zinc-300 transition-all hover:border-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          السابق
        </button>
        <button
          type="button"
          disabled={!choice}
          onClick={() => choice && onNext(choice)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          متابعة
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
