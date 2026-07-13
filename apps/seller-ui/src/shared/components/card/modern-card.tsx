import React from "react";

interface ModernCardProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
    elevated?: boolean;
    hoverable?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
    title,
    description,
    children,
    className = "",
    noPadding = false,
    elevated = false,
    hoverable = false,
}) => {
    const baseClasses = "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";
    const shadowClass = elevated ? "shadow-lg" : "shadow-soft";
    const hoverClass = hoverable ? "hover:shadow-lg transition-shadow duration-200 cursor-pointer" : "";
    const paddingClass = noPadding ? "" : "p-6";

    return (
        <div className={`${baseClasses} ${shadowClass} ${hoverClass} ${paddingClass} ${className}`}>
            {(title || description) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
