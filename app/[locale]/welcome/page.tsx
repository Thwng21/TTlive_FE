'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { User } from 'lucide-react';

interface UserProfile {
    displayName: string;
    gender?: 'male' | 'female' | 'other';
    address?: {
        city: string;
        ward: string;
    };
    username?: string;
}

export default function WelcomePage() {
    const t = useTranslations('Welcome');
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                setUser(JSON.parse(stored));
            } else {
                // If no user found, maybe redirect to login? 
                // But let's just leave it null for now or redirect
                router.push('/login');
            }
        } catch (e) {
            console.error("Error parsing user data", e);
        }
    }, [router]);

    const handleStart = () => {
        router.push('/stranger');
    };

    if (!user) {
        return <div className="min-h-screen bg-auth-dark flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-auth-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
             {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-pink/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>

            <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 custom-shadow">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {t('title', { name: user.displayName || user.username || 'User' })}
                    </h1>
                    <p className="text-slate-400">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-sm text-slate-500 mb-1">{t('displayName')}</div>
                        <div className="text-lg text-white font-medium">{user.displayName || t('notSet')}</div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-sm text-slate-500 mb-1">{t('gender')}</div>
                        <div className="text-lg text-white font-medium capitalize">
                            {user.gender ? user.gender : t('notSet')}
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <div className="text-sm text-slate-500 mb-1">{t('address')}</div>
                        <div className="text-lg text-white font-medium">
                            {user.address?.city ? `${user.address.ward ? user.address.ward + ', ' : ''}${user.address.city}` : t('notSet')}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] duration-200"
                >
                    {t('startChat')}
                </button>
            </div>
        </div>
    );
}
