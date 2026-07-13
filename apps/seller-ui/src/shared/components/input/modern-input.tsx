import React from "react";
import { AlertCircle } from "lucide-react";

interface ModernInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    hint?: string;
    error?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const ModernInput = React.forwardRef<
    HTMLInputElement,
    ModernInputProps
>(
    (
        {
            label,
            hint,
            error,
            icon,
            fullWidth = false,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <div className={fullWidth ? "w-full" : ""}>
                {label && (
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2">
                        {label}
                        {props.required && <span className="text-error-600"> *</span>}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full px-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none ${icon ? "pl-10" : ""
                            } ${error
                                ? "border-error-300 dark:border-error-700 focus:ring-2 focus:ring-error-500/20 focus:border-error-500"
                                : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-error-600 dark:text-error-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);

ModernInput.displayName = "ModernInput";
