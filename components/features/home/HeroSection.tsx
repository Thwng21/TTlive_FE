import React from 'react';
import { ArrowRight, VideoOff, Lock, Smile } from 'lucide-react';
import { StatsBadge } from './StatsBadge';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/i18n/navigation';
import { QRCodeSVG } from 'qrcode.react';

export const HeroSection = () => {
  const t = useTranslations('HomePage');

  return (
    <div className="flex flex-col items-center text-center gap-8 md:gap-12 max-w-4xl w-full">
      {/* Live Status Badge */}
      <StatsBadge text={t('online')} />

      {/* Headline */}
      <div className="space-y-4">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-[#1c1c0d] dark:text-white">
          {t.rich('title', {
             br: () => <br />,
             span: (chunks) => (
              <span className="relative inline-block whitespace-nowrap ml-4">
                <span className="relative z-10">{chunks}</span>
                {/* Highlighter effect */}
                <span className="absolute inset-x-0 bottom-2 md:bottom-4 h-[0.35em] bg-primary z-0 -rotate-1 skew-x-6 rounded-sm mix-blend-multiply dark:mix-blend-normal opacity-90"></span>
              </span>
             )
          })}
        </h1>
        <h2 className="text-lg md:text-2xl font-medium text-[#1c1c0d]/70 dark:text-white/70 max-w-2xl mx-auto leading-relaxed">
          {t('subtitle')}
        </h2>
      </div>

      {/* Feature Chips */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        <div className="group flex h-12 items-center justify-center gap-x-3 rounded-full bg-white dark:bg-[#2a2915] border border-[#e9e8ce] dark:border-white/10 px-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
          <VideoOff className="w-5 h-5 text-[#1c1c0d] dark:text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-[#1c1c0d] dark:text-white">{t('features.camera')}</span>
        </div>
        <div className="group flex h-12 items-center justify-center gap-x-3 rounded-full bg-white dark:bg-[#2a2915] border border-[#e9e8ce] dark:border-white/10 px-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
          <Lock className="w-5 h-5 text-[#1c1c0d] dark:text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-[#1c1c0d] dark:text-white">{t('features.encrypted')}</span>
        </div>
        <div className="group flex h-12 items-center justify-center gap-x-3 rounded-full bg-white dark:bg-[#2a2915] border border-[#e9e8ce] dark:border-white/10 px-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-default">
          <Smile className="w-5 h-5 text-[#1c1c0d] dark:text-primary group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-[#1c1c0d] dark:text-white">{t('features.genz')}</span>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex flex-col items-center gap-4 w-full mt-2">
        <Link href="/stranger">
            <button className="group relative flex items-center justify-center gap-4 bg-primary hover:bg-primary-hover text-[#1c1c0d] rounded-full h-20 px-12 w-full md:w-auto min-w-[320px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_50px_-12px_rgba(249,245,6,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(249,245,6,0.15)] cursor-pointer">
            <span className="text-2xl font-black tracking-tight">{t('startChat')}</span>
            <span className="bg-black/10 rounded-full p-2 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                <ArrowRight className="w-6 h-6 stroke-[3px] transition-transform group-hover:translate-x-0.5" />
            </span>
            </button>
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1c1c0d]/40 dark:text-white/30">
          {t('alwaysFree')}
        </p>

        {/* QR Code Section */}
        <div className="mt-8 p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-sm flex flex-col items-center gap-3 animate-fade-in-up">
           <div className="bg-white p-2 rounded-xl shadow-lg">
             <QRCodeSVG 
                value="https://ttlive-kappa.vercel.app/vi"
                size={120}
                level="M"
                includeMargin={false}
             />
           </div>
           <p className="text-xs font-medium text-[#1c1c0d]/60 dark:text-white/50">
             Quét để truy cập trên điện thoại
           </p>
        </div>
      </div>
    </div>
  );
};

