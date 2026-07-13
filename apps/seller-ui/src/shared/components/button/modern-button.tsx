import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white shadow-sm hover:shadow-md active:shadow-sm",
                secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-50",
                tertiary: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-50",
                outlined: "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-700",
                danger: "bg-error-600 hover:bg-error-700 text-white shadow-sm hover:shadow-md active:shadow-sm",
                success: "bg-success-600 hover:bg-success-700 text-white shadow-sm hover:shadow-md active:shadow-sm",
                warning: "bg-warning-600 hover:bg-warning-700 text-white shadow-sm hover:shadow-md active:shadow-sm",
            },
            size: {
                xs: "px-2 py-1 text-xs rounded-md",
                sm: "px-3 py-1.5 text-sm rounded-md",
                md: "px-4 py-2 text-base rounded-lg",
                lg: "px-6 py-3 text-lg rounded-lg",
                xl: "px-8 py-4 text-xl rounded-lg",
            },
            fullWidth: {
                true: "w-full",
            },
            loading: {
                true: "opacity-70 pointer-events-none",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            fullWidth: false,
            loading: false,
        },
    }
);

interface ModernButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
    (
        {
            variant,
            size,
            fullWidth,
            loading,
            icon,
            children,
            className = "",
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={buttonVariants({
                    variant,
                    size,
                    fullWidth,
                    loading,
                    className,
                })}
                {...props}
            >
                {loading ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        {children}
                    </>
                ) : (
                    <>
                        {icon}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

ModernButton.displayName = "ModernButton";
