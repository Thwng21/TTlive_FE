'use client';

import React, { useState } from 'react';
import { Link } from '@/src/i18n/navigation';
import { Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const t = useTranslations('Auth');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData);
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-family-inter bg-auth-dark text-slate-50">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-auth-dark items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black z-0"></div>
        {/* Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-pink/10 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-mint-green/10 rounded-full blur-[80px] mix-blend-screen"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-8">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-mint-green mb-6">
              <span className="text-3xl">✨</span>
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
             {t.rich('safeSpace', {
              br: () => <br />
             })}
          </h1>
          <p className="text-xl text-slate-400 font-light leading-relaxed">
            {t('connectAuthentic')}
          </p>
          
          <div className="mt-12 flex items-center space-x-4">
            <div className="flex -space-x-3">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-auth-dark bg-slate-700 flex items-center justify-center overflow-hidden">
                    <span className="text-xs">U{i}</span>
                  </div>
               ))}
            </div>
            <span className="text-sm text-slate-400">{t('joinFriends')}</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-auth-dark flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative">
        <div className="absolute top-6 right-6 z-20">
           <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <span className="text-mint-green text-3xl">✨</span>
                <span className="font-display font-bold text-xl tracking-tight text-white">VibeCheck</span>
            </div>

            <div className="text-left">
                <h2 className="font-display text-3xl font-bold text-white mb-2">{t('welcome')}</h2>
                <p className="text-slate-400">{t('subtitle')}</p>
            </div>

            {error && (
                <div className="bg-rose-pink/10 border border-rose-pink/20 text-rose-pink px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">{t('email')}</label>
                        <div className="relative">
                            <input 
                                id="email"
                                type="email" 
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="block w-full rounded-xl border-0 bg-auth-card py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-mint-green sm:text-sm sm:leading-6 transition-all duration-200 ease-in-out" 
                                placeholder="name@example.com"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Mail className="text-slate-500 w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">{t('password')}</label>
                        <div className="relative">
                            <input 
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="block w-full rounded-xl border-0 bg-auth-card py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-mint-green sm:text-sm sm:leading-6 transition-all duration-200 ease-in-out" 
                                placeholder="••••••••"
                            />
                            <div 
                                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-slate-300 text-slate-500 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-auth-card text-rose-pink focus:ring-rose-pink focus:ring-offset-0" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">{t('rememberMe')}</label>
                    </div>
                    <div className="text-sm">
                        <a href="#" className="font-medium text-rose-pink hover:text-rose-pink-hover transition-colors">{t('forgotPassword')}</a>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-xl bg-rose-pink px-3 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-pink-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-pink transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login')}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-auth-dark px-4 text-slate-500">{t('continueWith')}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl bg-auth-card px-3 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-800 transition-all duration-200">
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path d="M12.0003 20.45c4.6484 0 8.5428-3.1979 9.9497-7.75h-9.9497v-3.4h14.2882c.1627 1.1062.247 2.2396.247 3.4 0 7.8596-6.4069 14.25-14.5352 14.25-8.1283 0-14.5355-6.3904-14.5355-14.25s6.4072-14.25 14.5355-14.25c3.6766 0 7.0315 1.3443 9.6105 3.5602l-2.618 2.6074c-1.854-1.5034-4.225-2.4176-6.9925-2.4176-5.8398 0-10.7497 4.0954-12.285 9.5302l-.0226.1555-3.6934-.0292-.1242.1197c1.5542 5.3789 6.4882 9.4239 12.3332 9.4239z" fill="#fff" fillRule="evenodd"></path>
                        </svg>
                        <span className="text-sm font-medium">{t('continueGoogle')}</span>
                    </button>
                </div>
            </div>

            <p className="mt-10 text-center text-sm text-slate-400">
                {t('notMember')}
                <Link href="/register" className="font-semibold text-mint-green hover:text-emerald-400 transition-colors ml-1">{t('register')}</Link>
            </p>
            
            <div className="mt-auto pt-10 flex justify-center gap-6 text-xs text-slate-600">
                <a href="#" className="hover:text-slate-400 transition-colors">{t('privacyPolicy')}</a>
                <a href="#" className="hover:text-slate-400 transition-colors">{t('termsOfService')}</a>
            </div>
        </div>
      </div>
    </div>
  );
}
