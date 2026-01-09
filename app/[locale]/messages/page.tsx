'use client';
import React from 'react';

export default function MessagesDashboardPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-hidden h-screen flex">
        {/* Sidebar */}
        <aside className="w-full max-w-[360px] flex flex-col border-r border-white/5 bg-background-light/50 dark:bg-background-dark h-full relative z-20">
            {/* Sidebar Header / Search */}
            <div className="px-6 pt-8 pb-4">
                <h1 className="text-2xl font-bold tracking-tight mb-6 dark:text-white">Messages</h1>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-primary/70">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input className="block w-full py-3.5 pl-12 pr-4 text-sm bg-white dark:bg-[#2e4328] border-none rounded-xl focus:ring-2 focus:ring-primary dark:text-white placeholder-slate-400 dark:placeholder-[#a2c398] transition-all" placeholder="Search friends..." type="text" />
                </div>
            </div>
            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
                {/* Active Item */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-primary/10 cursor-pointer transition-colors border border-primary/20">
                    <div className="relative shrink-0">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 object-cover" data-alt="Portrait of Sarah J smiling outdoors" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHdSes8vG51q4q7xwidw2iPtVjYZx8j0kupC6v69zEPrd6Uk7kJ6_Kru90xUA1rBbmKzvW-O9bzVUK_litwiuXnUxkxBaejFfJ6pRMIrXZD7w06ASWwXEvMyaURZzVcdhGdXtCbfo0EDqyKfXd4z2lKsnXTTGJD6rg5CN_FUpbx4NkcrsN84CxlEl1K4iqi0emdxSiapqvvAA3FEkKoeDw-M25YX8d0yC-Q-UIDSxDJ6RIh0_cm3yL5m7RBoVHv7HGqbTP-v1kCP8")' }}></div>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full border-2 border-[#1e2b1b]"></div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <p className="text-base font-bold truncate dark:text-white">Sarah J.</p>
                            <p className="text-xs font-medium text-primary">2m</p>
                        </div>
                        <p className="text-sm dark:text-[#a2c398] truncate opacity-90">Voice message (0:15)</p>
                    </div>
                </div>
                {/* Inactive Items */}
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="relative shrink-0">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" data-alt="Portrait of Alex M looking serious" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCZMyEs-WZkP-4YGRElFJ9wq0D8lxaboGvDIUHymELotOCQWrs31Ms_DqCPHvP0qxAjOiN1OhlhclFuG0MJUBlJQqQMS7IilXujSCGlFGLQMbn16TtF3V4C7aPISOp6yLxvV5FmrM1Sc7XfP65ZTf-ddc_OHGdcQU_UXiYWkir73PGm-ZuyMrnSPEL5oQjZ3wbyhmaZyyK0QxkIHdoCswiHs4938ftM3atkh2kGW02snZ6YvGdq-njOzzznnTygUH8o05839neI8uU")' }}></div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <p className="text-base font-medium truncate dark:text-white/80 group-hover:text-white transition-colors">Alex M.</p>
                            <p className="text-xs dark:text-white/40">1h</p>
                        </div>
                        <p className="text-sm dark:text-white/50 truncate group-hover:text-[#a2c398] transition-colors">Can you send the file?</p>
                    </div>
                </div>
                {/* Additional Items would go here */}
            </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full relative">
            {/* Chat Header */}
            <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background-light dark:bg-background-dark z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full h-11 w-11 ring-2 ring-background-dark" data-alt="Portrait of Sarah J smiling outdoors" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDUIwyTujf6Zu6q6dGaIYn0LZVYZRYTmaTMAoR_dlieTNH_KDqGrse1KrK2oTpYzTzfQFl01J6xrV3itcjUC_iTn_CR9ZUsJE4SLxUd6M_VMNxtil6aP_VIntckmBaVAxRHd3L3qUOKSd8A8GB07le182h4Gg7LjROrmnEVmurHew4sG8GJ9QtU7MaT9MmVGYu_CYHIkApJLNdnhSMLuuIz5i0uLrN7l-TIheRhWoD-_OVZFGxZQJtYsg2mfayDBy6Flo9bCk6Nsjk")' }}></div>
                        {/* Online Glow Indicator */}
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-primary rounded-full ring-2 ring-background-dark shadow-[0_0_12px_rgba(83,210,45,0.8)]"></div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Sarah J.</h2>
                        <p className="text-sm text-primary font-medium tracking-wide">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">call</span>
                    </button>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">videocam</span>
                    </button>
                    <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </header>
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 flex flex-col bg-background-light dark:bg-background-dark">
                {/* Date Separator */}
                <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-slate-400 dark:text-slate-500">Today</span>
                </div>
                {/* Incoming Text */}
                <div className="flex items-end gap-3 max-w-[70%]">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 shrink-0 mb-1" data-alt="Portrait of Sarah J" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCSwQBjyAm8qw4N6gXcBSNHz5M2PmM5PjHvKX22c-pt_jeBKQEQ4Ts1_1cJaqvkWuNGRA4ZOKCsvGi-S9Ufb8dB1qwOvF2weNLs4AMcOgS87uDoiYJt4bG-bIlQBmQNNjw6pkaV3GfX1kbuOS3QoSZcAUFJfoZQEGqqFF6zlXH2aHSmSVRfs7kFHi9-x1OQoeQxGIkpxvqa8N0R2pSAu_n1jqOzsh5X0jBSNxuGD-2yFyxZHsldGmdY4uAB5YQiYVKixGRljbDT2WE")' }}></div>
                    <div className="flex flex-col gap-1">
                        <div className="px-5 py-3.5 bg-white dark:bg-[#2e4328] rounded-2xl rounded-bl-none shadow-sm dark:shadow-none">
                            <p className="text-[15px] leading-relaxed text-slate-700 dark:text-white font-normal">Hey! Are you free to chat about the new project layout?</p>
                        </div>
                        <span className="text-[11px] text-slate-400 pl-2">10:30 AM</span>
                    </div>
                </div>
                {/* Outgoing Text */}
                <div className="flex items-end justify-end gap-3 ml-auto max-w-[70%]">
                    <div className="flex flex-col gap-1 items-end">
                        <div className="px-5 py-3.5 bg-primary text-slate-900 rounded-2xl rounded-br-none shadow-sm">
                            <p className="text-[15px] leading-relaxed font-medium">Yeah, absolutely. I&apos;m just reviewing the assets you sent over earlier.</p>
                        </div>
                        <span className="text-[11px] text-slate-400 pr-2">10:32 AM</span>
                    </div>
                </div>
                
                {/* Input Area */}
                <div className="mt-auto px-8 pb-8 pt-2 bg-background-light dark:bg-background-dark">
                    <div className="relative flex items-end gap-2 p-2 bg-white dark:bg-[#1e2b1b] rounded-[2rem] shadow-lg border border-transparent dark:border-white/5">
                        {/* Attachment Button */}
                        <button className="h-12 w-12 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white/5 transition-all shrink-0">
                            <span className="material-symbols-outlined text-[24px]">add_circle</span>
                        </button>
                        {/* Text Input */}
                        <div className="flex-1 py-3">
                            <input className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#a2c398] text-[16px]" placeholder="Type a message..." type="text" />
                        </div>
                        {/* Right Actions */}
                        <div className="flex items-center gap-2 pr-1 pb-1">
                            <button className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
                                <span className="material-symbols-outlined text-[22px]">mic</span>
                            </button>
                            <button className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0">
                                <span className="material-symbols-outlined text-[22px]">image</span>
                            </button>
                            {/* Pink Send Button */}
                            <button className="h-10 w-14 rounded-[1.5rem] flex items-center justify-center bg-rose-accent hover:brightness-110 shadow-lg shadow-rose-accent/20 transition-all shrink-0 ml-1">
                                <span className="material-symbols-filled text-white text-[20px]">arrow_upward</span>
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-slate-400 dark:text-white/20 mt-3 font-medium tracking-wide">Press Enter to send</p>
                </div>
            </div>
        </main>
    </div>
  );
}
