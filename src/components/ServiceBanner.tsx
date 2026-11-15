import { IdCard, UserCircle, ChevronLeft } from 'lucide-react';

interface ServiceBannerProps {
  icon: typeof IdCard;
  title: string;
  subtitle: string;
  accentFrom: string;
  accentTo: string;
  onClick?: () => void;
}

export default function ServiceBanner({
  icon: Icon,
  title,
  subtitle,
  accentFrom,
  accentTo,
  onClick,
}: ServiceBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-brand-500/25 bg-[#0d0d1d] p-5 text-start shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-brand-400/60 hover:shadow-[0_0_28px_rgba(139,47,255,0.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/30"
    >
      {/* Gradient accent bar */}
      <div
        className="absolute inset-y-0 start-0 w-1.5 transition-all duration-500 group-hover:w-2"
        style={{ background: `linear-gradient(to bottom, ${accentFrom}, ${accentTo})` }}
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute -end-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ backgroundColor: accentFrom }}
      />

      <span
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_0_20px_rgba(139,47,255,0.35)] ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
      >
        <Icon className="h-7 w-7" strokeWidth={2.2} />
      </span>

      <div className="relative flex flex-1 flex-col">
        <h3 className="text-base font-extrabold text-zinc-50">{title}</h3>
        <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>
      </div>

      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-[0_0_16px_rgba(139,47,255,0.45)]">
        <ChevronLeft className="h-4 w-4" />
      </span>
    </button>
  );
}

export const SERVICE_ICONS = { IdCard, UserCircle };
