'use client';
import React from 'react';
import { ToastItem } from './ToastItem';
import { Toast } from '@/context/ToastContext';

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    );
};
