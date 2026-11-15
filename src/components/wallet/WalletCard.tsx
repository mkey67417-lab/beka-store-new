import { useState } from 'react';
import { LogIn, Plus, Star, Wallet } from 'lucide-react';
import TopUpModal from '@/components/wallet/TopUpModal';
import { ACCOUNT_ROUTE } from '@/lib/config';
import { formatPrice } from '@/lib/format';
import type { UserProfile } from '@/types';

interface WalletCardProps {
  profile: UserProfile | null;
  onTopUpSubmitted: () => void;
}

export default function WalletCard({ profile, onTopUpSubmitted }: WalletCardProps) {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-700 via-brand-600 to-electric-600 p-6 text-white shadow-2xl shadow-brand-700/30 animate-fade-up sm:p-8">
      <div className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
              <Wallet className="h-4 w-4" />
              رصيدك
            </span>
            <p dir="ltr" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {formatPrice(profile?.balance ?? 0)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
              <Star className="h-4 w-4" />
              نقاطك
            </span>
            <p dir="ltr" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {(profile?.points ?? 0).toLocaleString('en-US')}
            </p>
          </div>
        </div>

        {profile ? (
          <button
            type="button"
            onClick={() => setIsTopUpOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 active:translate-y-0 sm:w-fit"
          >
            <Plus className="h-4 w-4" />
            اشحن محفظتي
          </button>
        ) : (
          <a
            href={`#${ACCOUNT_ROUTE}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 sm:w-fit"
          >
            <LogIn className="h-4 w-4" />
            سجل دخولك عشان تشحن محفظتك
          </a>
        )}
      </div>
      {isTopUpOpen && profile && (
        <TopUpModal
          userId={profile.id}
          userName={profile.name ?? ''}
          onClose={() => setIsTopUpOpen(false)}
          onSubmitted={onTopUpSubmitted}
        />
      )}
    </section>
  );
}
