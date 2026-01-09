import React from 'react';

interface StatsBadgeProps {
  text?: string;
}

export const StatsBadge = ({ text = "50,000+ Online Now" }: StatsBadgeProps) => {
  return (
    <div className="animate-fade-in-up inline-flex items-center gap-3 px-5 py-2 bg-white/60 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-full shadow-sm">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-sm font-semibold tracking-wide text-[#1c1c0d] dark:text-white">{text}</span>
    </div>
  );
};
