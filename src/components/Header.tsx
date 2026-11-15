import { useState } from 'react';
import { Menu, UserRound } from 'lucide-react';
import SideMenu from '@/components/SideMenu';
import { useAuth } from '@/hooks/useAuth';
import { ACCOUNT_ROUTE, STORE_NAME } from '@/lib/config';

export default function Header() {
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const accountLabel = user ? (firstName ?? 'حسابي') : 'تسجيل الدخول';

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-brand-500/25 bg-[#070711]/90 shadow-[0_8px_32px_rgba(8,124,242,0.08)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#/" className="group flex items-center gap-3">
            <img
              src="/IMG_20261112_165719.jpg"
              alt={STORE_NAME}
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-electric-400/60 shadow-lg shadow-brand-600/40 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="bg-gradient-to-l from-brand-300 via-electric-400 to-brand-300 bg-clip-text text-base font-bold text-transparent sm:text-lg">{STORE_NAME}</span>
          </a>
          <div className="flex items-center gap-2">
            <a
              href={`#${ACCOUNT_ROUTE}`}
              aria-label="حسابي"
              className="flex h-10 items-center gap-2 rounded-xl border border-electric-500/30 bg-electric-500/5 px-3 text-sm font-semibold text-zinc-200 transition-all duration-200 hover:border-electric-400 hover:bg-electric-500/10 hover:text-electric-300 hover:shadow-[0_0_18px_rgba(25,207,255,0.18)]"
            >
              <UserRound className="h-5 w-5" />
              <span className="max-w-[7rem] truncate">{accountLabel}</span>
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/5 text-zinc-200 transition-all duration-200 hover:border-brand-400 hover:bg-brand-500/15 hover:text-brand-300 hover:shadow-[0_0_18px_rgba(139,47,255,0.24)]"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
