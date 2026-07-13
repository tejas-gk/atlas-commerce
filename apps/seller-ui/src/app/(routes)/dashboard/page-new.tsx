"use client";

import React, { useState } from "react";
import {
    TrendingUp,
    ShoppingCart,
    Users,
    Eye,
    MoreHorizontal
} from "lucide-react";
import {
    ModernCard,
    ModernButton,
    StatCard,
    ModernHeader,
} from "@/shared/components";
import { SalesChart } from "@/shared/components/charts/sales.chart";
import Link from "next/link";

// Dashboard Page Component
export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data for stat cards
    const stats = [
        {
            label: "Total Revenue",
            value: "$45,231.89",
            change: 20.1,
            subtitle: "This month",
            icon: <TrendingUp className="h-6 w-6" />,
            color: "primary" as const,
        },
        {
            label: "Total Orders",
            value: "1,234",
            change: 12.5,
            subtitle: "This week",
            icon: <ShoppingCart className="h-6 w-6" />,
            color: "success" as const,
        },
        {
            label: "New Customers",
            value: "342",
            change: -8.2,
            trend: "down" as const,
            subtitle: "This month",
            icon: <Users className="h-6 w-6" />,
            color: "warning" as const,
        },
        {
            label: "Unique Visits",
            value: "12,543",
            change: 5.3,
            subtitle: "Last 30 days",
            icon: <Eye className="h-6 w-6" />,
            color: "info" as const,
        },
    ];

    // Sample recent orders data
    const recentOrders = [
        {
            id: "#2401",
            customer: "Alex Johnson",
            email: "alex@example.com",
            amount: "$250.00",
            status: "completed",
            date: "2024-06-15",
        },
        {
            id: "#2400",
            customer: "Jordan Smith",
            email: "jordan@example.com",
            amount: "$1,890.00",
            status: "pending",
            date: "2024-06-14",
        },
        {
            id: "#2399",
            customer: "Casey Williams",
            email: "casey@example.com",
            amount: "$349.99",
            status: "completed",
            date: "2024-06-13",
        },
        {
            id: "#2398",
            customer: "Morgan Davis",
            email: "morgan@example.com",
            amount: "$750.00",
            status: "completed",
            date: "2024-06-13",
        },
    ];

    const getStatusColor = (
        status: string
    ): "primary" | "success" | "warning" | "error" => {
        switch (status) {
            case "completed":
                return "success";
            case "pending":
                return "warning";
            case "failed":
                return "error";
            default:
                return "primary";
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <ModernHeader
                title="Dashboard"
                subtitle="Welcome back! Here's your store performance"
                notifications={3}
                onNotificationClick={() => { }}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                userProfile={{
                    name: "Sarah Johnson",
                    email: "sarah@example.com",
                }}
                onLogoutClick={() => {
                    // Handle logout
                    console.log("Logging out...");
                }}
            />

            {/* Main Content */}
            <main className="p-6 md:p-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <ModernCard className="mb-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 border-primary-200 dark:border-primary-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                                Welcome back, Sarah! 👋
                            </h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Your store is performing great. Keep up the momentum!
                            </p>
                        </div>
                        <ModernButton variant="primary">
                            View Reports
                        </ModernButton>
                    </div>
                </ModernCard>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <StatCard
                            key={idx}
                            label={stat.label}
                            value={stat.value}
                            change={stat.change}
                            trend={stat.trend}
                            subtitle={stat.subtitle}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>

                {/* Charts and Tables Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <ModernCard
                        title="Revenue"
                        description="Last 6 months performance"
                        className="lg:col-span-2"
                    >
                        <div className="h-80">
                            <SalesChart />
                        </div>
                    </ModernCard>

                    {/* Quick Stats */}
                    <ModernCard title="Quick Stats" description="At a glance">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Conversion Rate
                                </span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                                    3.78%
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Avg Order Value
                                </span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                                    $64.90
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Return Rate
                                </span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                                    2.1%
                                </span>
                            </div>
                        </div>
                    </ModernCard>
                </div>

                {/* Recent Orders */}
                <ModernCard title="Recent Orders" description="Latest transactions">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Order
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Customer
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Amount
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Status
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Date
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-50">
                                            {order.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-50">
                                                    {order.customer}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {order.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-50">
                                            {order.amount}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === "completed"
                                                        ? "bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-300"
                                                        : "bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-300"
                                                    }`}
                                            >
                                                {order.status.charAt(0).toUpperCase() +
                                                    order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                                            {order.date}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                <MoreHorizontal className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* View All Link */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href="/dashboard/orders"
                            className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                        >
                            View all orders →
                        </Link>
                    </div>
                </ModernCard>
            </main>
        </div>
    );
}
