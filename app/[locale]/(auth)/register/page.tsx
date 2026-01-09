'use client';

import React, { useState } from 'react';
import { Link } from '@/src/i18n/navigation';
import { Mail, Lock, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
    const { register, isLoading, error } = useAuth();
    const t = useTranslations('Auth');
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await register(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-auth-deep font-family-space-grotesk text-white relative overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] bg-purple-900/20 rounded-full blur-3xl opacity-30"></div>
                <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-rose-pink/10 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-[10%] left-[20%] w-[35rem] h-[35rem] bg-mint-green/10 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Card Content */}
            <div className="relative w-full max-w-md bg-auth-card-deep rounded-3xl shadow-2xl shadow-black/50 p-8 md:p-12 z-10 border border-white/5">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-pink to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20 rotate-3 transform hover:rotate-6 transition-transform duration-300">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{t('joinUs')}</h1>
                    <p className="text-slate-400 text-sm">{t('cozyCorner')}</p>
                </div>

                {error && (
                    <div className="mb-6 bg-rose-pink/10 border border-rose-pink/20 text-rose-pink px-4 py-3 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <button type="button" className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 group">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"></path>
                            <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1904 21.1039L16.3233 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"></path>
                            <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"></path>
                            <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"></path>
                        </svg>
                        <span>{t('continueGoogle')}</span>
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-slate-500 uppercase tracking-wider">{t('orSignUpWithEmail')}</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <div className="space-y-4">
                         <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300 ml-1">Display Name</label>
                            <input 
                                type="text" 
                                required
                                value={formData.displayName}
                                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                className="w-full bg-[#202329] border-transparent rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:border-mint-green focus:ring-0 focus:shadow-[0_0_0_2px_rgba(110,231,183,0.3)] transition-all duration-300" 
                                placeholder="Your Name" 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="email">{t('email')}</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    <Mail className="w-5 h-5" />
                                </span>
                                <input 
                                    id="email" 
                                    type="email" 
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-[#202329] border-transparent rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:border-mint-green focus:ring-0 focus:shadow-[0_0_0_2px_rgba(110,231,183,0.3)] transition-all duration-300" 
                                    placeholder="hello@example.com" 
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-gray-300" htmlFor="password">{t('password')}</label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                    <Lock className="w-5 h-5" />
                                </span>
                                <input 
                                    id="password" 
                                    type="password" 
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full bg-[#202329] border-transparent rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:border-mint-green focus:ring-0 focus:shadow-[0_0_0_2px_rgba(110,231,183,0.3)] transition-all duration-300" 
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-rose-pink hover:bg-rose-pink-hover text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-rose-500/25 transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-[0px] mt-6 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('signUp')}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-slate-400 text-sm">
                        {t('alreadyMember')} <Link href="/login" className="text-white hover:text-mint-green font-semibold transition-colors">{t('login')}</Link>
                    </p>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <Lock className="w-3 h-3" />
                            <span>{t('safety')}</span>
                        </div>
                        <p className="text-[10px] text-gray-600">
                           {t('privacy')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
