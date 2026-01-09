'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@/src/i18n/navigation';
import { useAuth } from '@/hooks/useAuth';

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { logout } = useAuth();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#151515] flex items-center justify-center overflow-hidden">
                         {/* Placeholder Avatar */}
                         <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                            alt="User" 
                            className="w-full h-full object-cover"
                         />
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-[#1e1e1e] border border-[#333] shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-[#333]">
                        <p className="text-sm text-white font-medium">{user?.displayName || user?.username || 'Guest'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'No email'}</p>
                    </div>
                    
                    <div className="py-1">
                        <Link 
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="material-symbols-outlined text-xl">person</span>
                            My Profile
                        </Link>
                        <Link 
                           href="/profile"
                           className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                           onClick={() => setIsOpen(false)}
                        >
                            <span className="material-symbols-outlined text-xl">post_add</span>
                            Create Post
                        </Link>
                         <Link 
                           href="/profile?tab=edit"
                           className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                           onClick={() => setIsOpen(false)}
                        >
                            <span className="material-symbols-outlined text-xl">edit_note</span>
                            Edit Info
                        </Link>
                    </div>

                    <div className="border-t border-[#333] py-1">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                logout();
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
