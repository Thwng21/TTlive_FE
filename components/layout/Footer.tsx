import React from 'react';
import { Link } from '@/src/i18n/navigation';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('Footer');
  
  return (
    <footer className="relative z-10 w-full py-8 text-center px-4 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm font-medium text-[#1c1c0d]/50 dark:text-white/40 mb-4">
        <Link href="#" className="hover:text-[#1c1c0d] dark:hover:text-primary transition-colors flex items-center gap-1 group relative">
            <ShieldCheck className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity absolute -left-6" />
            {t('safetyCenter')}
        </Link>
        <span className="hidden md:inline text-[#1c1c0d]/20 dark:text-white/10">•</span>
        <Link href="#" className="hover:text-[#1c1c0d] dark:hover:text-primary transition-colors">{t('terms')}</Link>
        <span className="hidden md:inline text-[#1c1c0d]/20 dark:text-white/10">•</span>
        <Link href="#" className="hover:text-[#1c1c0d] dark:hover:text-primary transition-colors">{t('privacy')}</Link>
        <div className="hidden md:flex gap-4 ml-8 border-l pl-8 border-[#1c1c0d]/10 dark:border-white/10">
            <Link href="/video" className="text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors">Video UI</Link>
            <Link href="/messages" className="text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors">Messages UI</Link>
            <Link href="/profile" className="text-xs font-bold uppercase tracking-wider hover:text-primary transition-colors">Profile UI</Link>
        </div>
      </div>
      <p className="text-[11px] text-[#1c1c0d]/30 dark:text-white/20">{t('copyright')}</p>
    </footer>
  );
};
