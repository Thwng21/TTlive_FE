'use client';

import { useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { useLocale } from 'next-intl';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { LoginDto, RegisterDto } from '@/types/auth';
import { useToast } from '@/context/ToastContext';
import { chatStore } from '@/services/chatStore';
import { disconnectSocket } from '@/services/socket.service';

export const useAuth = () => {
    const router = useRouter();
    const locale = useLocale();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: LoginDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            // Store token in localStorage or cookie
            localStorage.setItem('accessToken', response.access_token);
            Cookies.set('accessToken', response.access_token, { expires: 7 }); // Cookie for Middleware
            localStorage.setItem('user', JSON.stringify(response.user));
            Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
            
            showToast("Success", "Login successful! Redirecting...", "success");
            setTimeout(() => {
                // Force full reload to ensure cookies are fresh and middleware processes redirection correctly
                // This fixes mobile login freeze issues
                window.location.href = `/${locale}/stranger`; 
            }, 1000);
        } catch (err: any) {
            setError(err.message);
            showToast("Login Failed", err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterDto) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(data);
            
            showToast("Success", "Account created successfully! Please login.", "success");
            router.push('/login');
        } catch (err: any) {
            setError(err.message);
            showToast("Registration Failed", err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Clear all local app state
        Cookies.remove('accessToken');
        Cookies.remove('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        chatStore.reset();
        disconnectSocket();
        
        showToast("Logged Out", "See you again soon!", "info");
        router.push('/login');
    };

    return {
        login,
        register,
        logout,
        isLoading,
        error
    };
};
