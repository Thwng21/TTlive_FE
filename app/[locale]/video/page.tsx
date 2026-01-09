'use client';
import React, { useState } from 'react';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export default function VideoChatPage() {
  const [permissionGranted, setPermissionGranted] = useState(false);

  // If permission is not granted, show the modal overlay (simulated here as part of the page)
  if (!permissionGranted) {
    return (
      <div className="bg-background-dark text-white font-display overflow-hidden h-screen w-full flex flex-col relative">
           
           {/* Background Blurred (Simulated Previous State) */}
           <div className="absolute inset-0 z-0 opacity-30 blur-sm pointer-events-none bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAQ_3vr7UGyHyuu6eqw-MaeHgOE9xZ5N458_iFxqx0cuhnYZ1mg98SeL0TwXsYXxu2CBus1Fk0ANqENnCQLUZyihejZUxsuMdTeNFmxFizqrXh8GAdXTrH7M4WKUvaAgRWQKPnC5l9VnlSgWDm69ruH_MTn-IAN6e2csU2IibPt9AtW_BxZOusPJf8nzposIsGktjT9qxK5kZumOVI4meuAC73z7IZSGK2zKiUVUD1uvO2Tlk-TNtpRrQEiAh6kgQ2yhPdjRcJIDQ')] bg-cover bg-center"></div>

           <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                <div className="relative w-full max-w-[480px] bg-[#262629] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-[fadeIn_0.3s_ease-out]">
                    <div className="pt-10 pb-2 flex justify-center">
                        <div className="relative">
                            <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[40px]">videocam</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#262629] p-1 rounded-full">
                                <div className="size-7 bg-[#5BC0A2] rounded-full flex items-center justify-center text-background-dark">
                                    <span className="material-symbols-outlined text-[16px]">lock</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 pb-4 text-center">
                        <h2 className="text-[28px] font-bold text-white mb-3 tracking-tight leading-tight">Enable Camera Access</h2>
                        <p className="text-gray-300 text-[15px] leading-relaxed mb-6">
                            To start your secure video call, we need access to your camera. Your video feed is end-to-end encrypted and never stored on our servers.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 mb-8">
                            <span className="material-symbols-outlined text-[#5BC0A2] text-[16px]">verified_user</span>
                            <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">Privacy Protected</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 px-8 pb-10">
                        <button 
                            onClick={() => setPermissionGranted(true)}
                            className="w-full h-12 bg-[#5BC0A2] hover:bg-[#4ab092] text-[#0f291e] font-bold text-base rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5BC0A2]/10"
                        >
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            Allow Camera Access
                        </button>
                        <button className="w-full h-12 bg-[#4C4C4F] hover:bg-[#3c3c3f] text-gray-200 font-semibold text-base rounded-lg transition-colors flex items-center justify-center">
                            Continue without Video
                        </button>
                    </div>
                </div>
           </div>
      </div>
    );
  }

  // Active Connection State
  return (
    <div className="h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display transition-colors duration-200 flex">
         {/* Global Sidebar (Hidden on mobile) */}
        <nav className="hidden md:flex flex-col justify-between bg-surface-dark w-20 lg:w-64 border-r border-slate-800/50 p-4 transition-all duration-300 z-20">
            <div className="flex flex-col gap-6">
                {/* App Logo/Icon */}
                <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shrink-0">
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>videocam</span>
                    </div>
                    <span className="text-lg font-bold text-white hidden lg:block tracking-tight">SecureMeet</span>
                </div>
                {/* Navigation */}
                <div className="flex flex-col gap-2">
                    <button className="flex items-center gap-4 px-3 py-3 rounded-xl bg-primary/20 text-white group hover:bg-primary/30 transition-colors">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>home</span>
                        <span className="text-sm font-medium hidden lg:block">Home</span>
                    </button>
                    <button className="flex items-center gap-4 px-3 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontSize: '24px' }}>chat_bubble</span>
                        <span className="text-sm font-medium hidden lg:block">Chat</span>
                    </button>
                </div>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20" data-alt="User profile picture showing a smiling professional" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCU8JZVfhZYbyPK6x9XOR4rWByXneaX1lCWx76ZwDavU1uQF11XXMQ5O5yA6Zg0U4rB9JkzwrtNKg8iNO5eOHM-pvF8wFRa9T7trvRGuL6JkYNxq5WgLwiXunxbnoz2a8snGZ1xeCXtoEIjns3J5fNis2TZix00SJza0I9wE7xjaQB8bd-vVaMd1OLWm3qlHv3ovUtAVeQXAGCzP4fwvhdjgdwAaim-DaMr9ed-uEdU7gZ_biJKEE2AUNj5msfbw5l-5FSfX_dnBEc")' }}></div>
                <div className="flex flex-col hidden lg:flex overflow-hidden">
                    <p className="text-white text-sm font-bold truncate">Alex Morgan</p>
                    <p className="text-slate-400 text-xs truncate">Online</p>
                </div>
            </div>
        </nav>

        {/* Main Stage */}
        <main className="flex-1 flex flex-col relative h-full">
            {/* Secure Connection Header (Floating) */}
            <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start pointer-events-none">
                <div className="flex items-center gap-x-2 rounded-full bg-surface-dark/90 backdrop-blur-sm border border-[#40BF4C]/30 pl-3 pr-4 py-1.5 shadow-lg pointer-events-auto">
                    <span className="material-symbols-outlined text-[#40BF4C] animate-pulse" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>lock</span>
                    <p className="text-[#40BF4C] text-xs font-bold uppercase tracking-wider">Encrypted &amp; Secure</p>
                </div>
                <div className="pointer-events-auto">
                    <LanguageSwitcher />
                </div>
            </div>
            
            {/* Video Grid Area */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden">
                <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden secure-glow border border-[#40BF4C]/40 ring-1 ring-white/5 group shadow-[0_0_30px_rgba(64,191,76,0.25)]">
                    {/* Main Video Feed */}
                    <div className="absolute inset-0 bg-cover bg-center" data-alt="Live camera feed showing a person looking at the screen in a home office setting" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAQ_3vr7UGyHyuu6eqw-MaeHgOE9xZ5N458_iFxqx0cuhnYZ1mg98SeL0TwXsYXxu2CBus1Fk0ANqENnCQLUZyihejZUxsuMdTeNFmxFizqrXh8GAdXTrH7M4WKUvaAgRWQKPnC5l9VnlSgWDm69ruH_MTn-IAN6e2csU2IibPt9AtW_BxZOusPJf8nzposIsGktjT9qxK5kZumOVI4meuAC73z7IZSGK2zKiUVUD1uvO2Tlk-TNtpRrQEiAh6kgQ2yhPdjRcJIDQ")' }}></div>
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
                    {/* Top Left Indicators */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <div className="px-3 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                            <div className="size-2 rounded-full bg-[#40BF4C] animate-pulse"></div>
                            <span className="text-white text-xs font-medium">Camera Active</span>
                        </div>
                    </div>
                    {/* Bottom Left Name Tag */}
                    <div className="absolute bottom-4 left-4">
                        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-sm font-medium border border-white/10 flex items-center gap-2">
                            <span>You (Host)</span>
                            <span className="material-symbols-outlined text-[#40BF4C]" style={{ fontSize: '16px' }}>mic</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Control Bar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-surface-dark/90 backdrop-blur-xl border border-white/10 shadow-2xl transition-all hover:scale-105">
                    <button className="p-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors flex items-center justify-center group relative" title="Mute Microphone">
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>mic</span>
                    </button>
                    <button className="p-3 rounded-xl bg-[#40BF4C] text-white shadow-lg shadow-[#40BF4C]/20 hover:bg-[#40BF4C]/90 transition-colors flex items-center justify-center" title="Turn Off Camera">
                        <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>videocam</span>
                    </button>
                    <div className="w-px h-8 bg-white/10 mx-1"></div>
                    <button className="ml-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm tracking-wide hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>call_end</span>
                        End Call
                    </button>
                </div>
            </div>
        </main>
    </div>
  );
}
