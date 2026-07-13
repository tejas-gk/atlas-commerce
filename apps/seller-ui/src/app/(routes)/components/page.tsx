"use client";

import React, { useState } from "react";
import {
    ModernCard,
    ModernButton,
    StatCard,
    ModernInput,
    ModernHeader,
    ModernTable,
} from "@/shared/components";
import {
    TrendingUp,
    ShoppingCart,
    Users,
    Eye,
    Heart,
    Bell,
    Settings,
} from "lucide-react";

export default function ComponentShowcase() {
    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const stats = [
        {
            label: "Total Revenue",
            value: "$45,231.89",
            change: 20.1,
            icon: <TrendingUp className="h-6 w-6" />,
            color: "primary" as const,
        },
        {
            label: "Total Orders",
            value: "1,234",
            change: 12.5,
            icon: <ShoppingCart className="h-6 w-6" />,
            color: "success" as const,
        },
        {
            label: "New Customers",
            value: "342",
            change: -8.2,
            trend: "down" as const,
            icon: <Users className="h-6 w-6" />,
            color: "warning" as const,
        },
        {
            label: "Unique Visits",
            value: "12,543",
            change: 5.3,
            icon: <Eye className="h-6 w-6" />,
            color: "info" as const,
        },
    ];

    const sampleData = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com", amount: "$250" },
        { id: 2, name: "Bob Smith", email: "bob@example.com", amount: "$500" },
        { id: 3, name: "Carol White", email: "carol@example.com", amount: "$750" },
    ];

    const columns = [
        { header: "Name", accessorKey: "name", sortable: true },
        { header: "Email", accessorKey: "email" },
        { header: "Amount", accessorKey: "amount" },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <ModernHeader
                title="Component Showcase"
                subtitle="Minimals-inspired UI components"
                searchValue={search}
                onSearchChange={setSearch}
                userProfile={{
                    name: "Designer",
                    email: "designer@example.com",
                }}
            />

            {/* Main Content */}
            <main className="p-6 md:p-8 max-w-6xl mx-auto">
                {/* Stat Cards Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Stat Cards
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Display key metrics with trend indicators
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <StatCard key={idx} {...stat} subtitle="This month" />
                        ))}
                    </div>
                </section>

                {/* Cards Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Modern Cards
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Flexible container for content grouping
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ModernCard title="Basic Card" description="With title and description">
                            <p className="text-gray-600 dark:text-gray-400">
                                This is the card content area. You can put any content here.
                            </p>
                        </ModernCard>

                        <ModernCard title="Elevated Card" elevated description="With elevated shadow">
                            <p className="text-gray-600 dark:text-gray-400">
                                This card has an elevated shadow for more prominence.
                            </p>
                        </ModernCard>

                        <ModernCard title="Hoverable Card" hoverable description="Try hovering!">
                            <p className="text-gray-600 dark:text-gray-400">
                                This card responds to hover interactions.
                            </p>
                        </ModernCard>

                        <ModernCard noPadding>
                            <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg" />
                        </ModernCard>
                    </div>
                </section>

                {/* Buttons Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Buttons
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Multiple variants and sizes available
                    </p>

                    <ModernCard title="Variants" description="Different button styles">
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Primary Buttons
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <ModernButton variant="primary">Primary</ModernButton>
                                    <ModernButton variant="primary" icon={<Heart className="h-4 w-4" />}>
                                        With Icon
                                    </ModernButton>
                                    <ModernButton variant="primary" disabled>
                                        Disabled
                                    </ModernButton>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Secondary Buttons
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <ModernButton variant="secondary">Secondary</ModernButton>
                                    <ModernButton variant="secondary" icon={<Bell className="h-4 w-4" />}>
                                        Notification
                                    </ModernButton>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Other Variants
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <ModernButton variant="outlined">Outlined</ModernButton>
                                    <ModernButton variant="tertiary">Tertiary</ModernButton>
                                    <ModernButton variant="danger">Delete</ModernButton>
                                    <ModernButton variant="success">Confirm</ModernButton>
                                    <ModernButton variant="warning">Warning</ModernButton>
                                </div>
                            </div>
                        </div>
                    </ModernCard>

                    <ModernCard title="Sizes" description="Different button sizes" className="mt-6">
                        <div className="flex flex-wrap gap-3 items-center">
                            <ModernButton size="xs">Extra Small</ModernButton>
                            <ModernButton size="sm">Small</ModernButton>
                            <ModernButton size="md">Medium</ModernButton>
                            <ModernButton size="lg">Large</ModernButton>
                            <ModernButton size="xl">Extra Large</ModernButton>
                        </div>
                    </ModernCard>
                </section>

                {/* Inputs Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Form Inputs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Text inputs with validation and helper text
                    </p>

                    <ModernCard>
                        <div className="space-y-6">
                            <ModernInput
                                label="Default Input"
                                placeholder="Enter text..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />

                            <ModernInput
                                label="With Icon"
                                placeholder="Search..."
                                icon={<Settings className="h-5 w-5" />}
                            />

                            <ModernInput
                                label="With Helper Text"
                                placeholder="Enter email"
                                hint="We'll send you updates about your account"
                            />

                            <ModernInput
                                label="With Error"
                                error="This field is required"
                                placeholder="Enter something..."
                            />

                            <ModernInput
                                label="Disabled State"
                                disabled
                                placeholder="You cannot type here"
                            />

                            <ModernInput
                                label="Required Field"
                                required
                                placeholder="This is required"
                            />
                        </div>
                    </ModernCard>
                </section>

                {/* Table Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Table
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Sortable table with hover states
                    </p>

                    <ModernCard noPadding>
                        <ModernTable
                            columns={columns}
                            data={sampleData}
                            sortBy={sortBy as any}
                            onSort={(col) => setSortBy(col as string)}
                        />
                    </ModernCard>
                </section>

                {/* Color Palette */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Color Palette
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Minimals-inspired colors
                    </p>

                    <div className="space-y-6">
                        <ModernCard title="Primary Colors">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { name: "Primary 600", color: "bg-primary-600" },
                                    { name: "Success 600", color: "bg-success-600" },
                                    { name: "Warning 600", color: "bg-warning-600" },
                                    { name: "Error 600", color: "bg-error-600" },
                                ].map((c) => (
                                    <div key={c.name}>
                                        <div className={`${c.color} h-24 rounded-lg mb-2`} />
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {c.name}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ModernCard>

                        <ModernCard title="Neutral Colors">
                            <div className="grid grid-cols-5 gap-2">
                                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                                    <div key={shade}>
                                        <div
                                            className={`bg-gray-${shade} h-16 rounded mb-1 border border-gray-200 dark:border-gray-700`}
                                        />
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {shade}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ModernCard>
                    </div>
                </section>

                {/* Spacing Reference */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
                        Spacing Scale
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        xs (4px) • sm (8px) • md (12px) • lg (16px) • xl (24px) • 2xl (32px) •
                        3xl (48px) • 4xl (64px)
                    </p>

                    <ModernCard>
                        <div className="space-y-4">
                            {[
                                { name: "xs", size: "w-1 h-1" },
                                { name: "sm", size: "w-2 h-2" },
                                { name: "md", size: "w-3 h-3" },
                                { name: "lg", size: "w-4 h-4" },
                                { name: "xl", size: "w-6 h-6" },
                                { name: "2xl", size: "w-8 h-8" },
                                { name: "3xl", size: "w-12 h-12" },
                                { name: "4xl", size: "w-16 h-16" },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center gap-4">
                                    <span className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {item.name}
                                    </span>
                                    <div className={`bg-primary-500 ${item.size}`} />
                                </div>
                            ))}
                        </div>
                    </ModernCard>
                </section>
            </main>
        </div>
    );
}
