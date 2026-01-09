'use client';

import { useState } from 'react';
import { useRouter } from '@/src/i18n/navigation';
import { authService } from '@/services/auth.service';
import { LoginDto, RegisterDto } from '@/types/auth';
import { useToast } from '@/context/ToastContext';
import { chatStore } from '@/services/chatStore';
import { disconnectSocket } from '@/services/socket.service';

export const useAuth = () => {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (data: LoginDto) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await authService.login(data);
            // Store token in localStorage or cookie
            localStorage.setItem('accessToken', response.access_token || response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            showToast("Success", "Login successful! Redirecting...", "success");
            setTimeout(() => {
                 router.push('/stranger'); // Redirect to Stranger Chat (Main App) after login
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
            const response = await authService.register(data);
            localStorage.setItem('accessToken', response.access_token || response.accessToken);
            localStorage.setItem('user', JSON.stringify(response.user));

            showToast("Success", "Account created successfully!", "success");
            router.push('/stranger');
        } catch (err: any) {
            setError(err.message);
            showToast("Registration Failed", err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Clear all local app state
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
