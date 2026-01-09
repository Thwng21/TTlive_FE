import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, label, error, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-slate-300 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "block w-full rounded-xl border-0 bg-auth-card/50 py-3.5 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500",
              "focus:ring-2 focus:ring-inset focus:ring-mint-green/50 sm:text-sm sm:leading-6 transition-all duration-200 ease-in-out",
              Icon && "pr-10",
              className
            )}
            {...props}
          />
          {Icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
AuthInput.displayName = "AuthInput";
