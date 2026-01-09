'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';
import { ChangeEvent, useState, useTransition } from 'react';

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    const onSelectChange = (nextLocale: string) => {
        setIsOpen(false);
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'vi', label: 'Tiếng Việt' },
        { code: 'zh', label: '中文' },
    ];

    const currentLang = languages.find(l => l.code === locale);

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-slate-700 hover:bg-white/20"
                    disabled={isPending}
                >
                    {isPending ? '...' : (currentLang?.label || locale.toUpperCase())}
                    <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-[#1e293b] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-64 overflow-y-auto">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => onSelectChange(lang.code)}
                                className={`block w-full text-left px-4 py-2 text-sm ${locale === lang.code ? 'bg-[#334155] text-white' : 'text-gray-300 hover:bg-[#334155] hover:text-white'}`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
