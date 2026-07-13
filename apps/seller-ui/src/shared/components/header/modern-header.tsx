import React from "react";
import { Bell, Search, Settings, LogOut, Menu } from "lucide-react";

interface ModernHeaderProps {
    title?: string;
    subtitle?: string;
    onMenuClick?: () => void;
    notifications?: number;
    onNotificationClick?: () => void;
    onSettingsClick?: () => void;
    onLogoutClick?: () => void;
    userProfile?: {
        name: string;
        email: string;
        avatar?: string;
    };
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
    title,
    subtitle,
    onMenuClick,
    notifications = 0,
    onNotificationClick,
    onSettingsClick,
    onLogoutClick,
    userProfile,
    searchValue,
    onSearchChange,
}) => {
    return (
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-soft">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                    {title && (
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Middle Section - Search */}
                {onSearchChange !== undefined && (
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    {onNotificationClick && (
                        <button
                            onClick={onNotificationClick}
                            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 h-2 w-2 bg-error-600 rounded-full animate-pulse" />
                            )}
                        </button>
                    )}

                    {/* Settings */}
                    {onSettingsClick && (
                        <button
                            onClick={onSettingsClick}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                    {/* User Profile */}
                    {userProfile && (
                        <div className="flex items-center gap-3 pl-2">
                            {userProfile.avatar ? (
                                <img
                                    src={userProfile.avatar}
                                    alt={userProfile.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                        {userProfile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                    {userProfile.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {userProfile.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    {onLogoutClick && (
                        <button
                            onClick={onLogoutClick}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
