import { ChevronLeft, Coins } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
  accentColor: string;
  onSelect: (pkg: Package) => void;
}

export default function PackageCard({ pkg, accentColor, onSelect }: PackageCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(pkg)}
      className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-electric-500/20 bg-[#0d0d1d] p-5 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-electric-400/70 hover:shadow-[0_0_24px_rgba(25,207,255,0.16)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-electric-400/30"
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-zinc-950 shadow-[0_0_16px_rgba(139,47,255,0.3)]"
          style={{ backgroundColor: accentColor }}
        >
          <Coins className="h-6 w-6" strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-base font-bold text-zinc-50">{pkg.label_ar}</p>
          <p className="mt-0.5 text-sm font-semibold text-electric-300">{formatPrice(pkg.price_sdg)}</p>
        </div>
      </div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-electric-500/30 bg-electric-500/10 text-electric-300 transition-all duration-300 group-hover:bg-electric-600 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(25,207,255,0.4)]">
        <ChevronLeft className="h-4 w-4" />
      </span>
    </button>
  );
}
