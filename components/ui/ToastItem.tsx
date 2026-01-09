'use client';
import React, { useEffect, useState } from 'react';
import { Toast, ToastType } from '@/context/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="w-6 h-6 text-white" />,
    error: <XCircle className="w-6 h-6 text-white" />,
    warning: <AlertTriangle className="w-6 h-6 text-white" />,
    info: <Info className="w-6 h-6 text-white" />,
};

const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
};

const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const [progress, setProgress] = useState(100);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!toast.duration) return;

        const startTime = Date.now();
        const endTime = startTime + toast.duration;

        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, endTime - now);
            const percentage = (remaining / toast.duration!) * 100;
            
            setProgress(percentage);

            if (remaining === 0) {
                handleLocalClose();
            }
        }, 10);

        return () => clearInterval(timer);
    }, [toast.duration]);

    const handleLocalClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(toast.id), 300); // Wait for exit animation
    };

    return (
        <div 
            className={`
                relative flex items-center w-80 md:w-96 p-4 mb-3 rounded-lg shadow-lg bg-white border-l-4 overflow-hidden transform transition-all duration-300 ease-in-out z-50
                ${borderColors[toast.type]}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            {/* Icon Wrapper */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mr-4 ${bgColors[toast.type]}`}>
                {icons[toast.type]}
            </div>

            {/* Content */}
            <div className="flex-1 mr-2">
                <h4 className="font-bold text-gray-800 text-sm">{toast.title}</h4>
                <p className="text-gray-600 text-xs mt-0.5">{toast.message}</p>
            </div>

            {/* Close Button */}
            <button onClick={handleLocalClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
                <div 
                    className={`h-full ${bgColors[toast.type]}`} 
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};
