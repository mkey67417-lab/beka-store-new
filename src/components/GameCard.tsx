import { CreditCard, Gamepad2, ChevronLeft, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { navigateTo } from '@/hooks/useHashRoute';
import type { Game } from '@/types';

interface GameCardProps {
  game: Game;
  packageCount: number;
  startingPrice: number | null;
  posterUrl: string;
  isFeatured?: boolean;
}

export default function GameCard({
  game,
  packageCount,
  startingPrice,
  posterUrl,
  isFeatured = false,
}: GameCardProps) {
  const isVisa = game.id === 'us-visa';

  return (
    <button
      type="button"
      onClick={() => navigateTo(`/game/${game.id}`)}
      className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-brand-500/25 bg-[#0d0d1d] text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-400/70 hover:shadow-[0_0_36px_rgba(139,47,255,0.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/30"
    >
      {/* Poster image section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={posterUrl}
          alt={game.name_en}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1d] via-[#0d0d1d]/40 to-transparent" />
        {/* Accent glow */}
        <div
          className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ backgroundColor: game.accent_color }}
        />
        {/* Featured badge */}
        {isFeatured && (
          <span className="absolute top-3 end-3 flex items-center gap-1 rounded-full border border-brand-400/60 bg-brand-600/80 px-3 py-1 text-xs font-bold text-white shadow-[0_0_16px_rgba(139,47,255,0.5)] backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            الأكثر طلباً
          </span>
        )}
        {/* Icon badge */}
        <span
          className="absolute bottom-3 start-3 flex h-12 w-12 items-center justify-center rounded-2xl text-zinc-950 shadow-[0_0_20px_rgba(139,47,255,0.4)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundColor: game.accent_color }}
        >
          {isVisa ? (
            <CreditCard className="h-6 w-6" strokeWidth={2.2} />
          ) : (
            <Gamepad2 className="h-6 w-6" strokeWidth={2.2} />
          )}
        </span>
      </div>

      {/* Content section */}
      <div className="relative flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold text-zinc-50">{game.name_ar}</h3>
        <p className="mt-0.5 text-sm text-zinc-400">{game.name_en}</p>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
          <span className="text-sm text-zinc-400">{packageCount} باقات</span>
          {startingPrice !== null && (
            <span className="text-sm font-bold text-brand-300">من {formatPrice(startingPrice)}</span>
          )}
        </div>
        {/* Hover arrow */}
        <span className="absolute bottom-5 end-5 flex h-9 w-9 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:bg-brand-600 group-hover:text-white group-hover:opacity-100 group-hover:shadow-[0_0_16px_rgba(139,47,255,0.45)]">
          <ChevronLeft className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}
