import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    color?: "primary" | "success" | "warning" | "error" | "info";
    trend?: "up" | "down" | "neutral";
    subtitle?: string;
    className?: string;
}

const colorClasses = {
    primary: "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400",
    success: "bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400",
    warning: "bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400",
    error: "bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400",
    info: "bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400",
};

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    icon,
    color = "primary",
    trend,
    subtitle,
    className = "",
}) => {
    const isPositive = trend === "up" || (typeof change === "number" && change > 0);
    const isNegative = trend === "down" || (typeof change === "number" && change < 0);

    return (
        <div
            className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-soft transition-all duration-200 hover:shadow-md ${className}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-50">
                        {value}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                    {change !== undefined && (
                        <div className="mt-3 flex items-center gap-1">
                            {isPositive && (
                                <>
                                    <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
                                    <span className="text-xs font-semibold text-success-600 dark:text-success-400">
                                        +{change}%
                                    </span>
                                </>
                            )}
                            {isNegative && (
                                <>
                                    <TrendingDown className="h-4 w-4 text-error-600 dark:text-error-400" />
                                    <span className="text-xs font-semibold text-error-600 dark:text-error-400">
                                        {change}%
                                    </span>
                                </>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                vs last month
                            </span>
                        </div>
                    )}
                </div>
                {icon && (
                    <div
                        className={`rounded-lg p-3 ${colorClasses[color]}`}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};
