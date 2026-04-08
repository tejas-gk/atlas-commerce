"use client";

import React from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { SalesChart } from "@/shared/components/charts/sales.chart";
import GeographicalMap from "@/shared/components/charts/geographicalMap";

const metrics = [
    { label: "Gross Revenue", value: "$82,410", delta: "+14.2% vs last month" },
    { label: "Conversion Rate", value: "3.78%", delta: "+0.6% this week" },
    { label: "New Customers", value: "1,248", delta: "+12% in 30 days" },
    { label: "Avg. Order Value", value: "$64.90", delta: "Stable trend" },
];

const deviceData = [
    { name: "Phone", value: 55 },
    { name: "Tablet", value: 20 },
    { name: "Computer", value: 25 },
];
const COLORS = ["#34d399", "#facc15", "#60a5fa"];

const orders = [
    { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
    { id: "ORD-002", customer: "Jane Smith", amount: "$180", status: "Pending" },
    { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid" },
    { id: "ORD-004", customer: "Bob Lee", amount: "$90", status: "Failed" },
    { id: "ORD-005", customer: "Bob Lee", amount: "$90", status: "Failed" },
    { id: "ORD-006", customer: "Bob Lee", amount: "$90", status: "Failed" },
];

const columns = [
    {
        accessorKey: "id",
        header: "Order ID",
    },
    {
        accessorKey: "customer",
        header: "Customer",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: any) => {
            const value = getValue();
            const color =
                value === "Paid"
                    ? "text-emerald-400"
                    : value === "Pending"
                        ? "text-yellow-400"
                        : "text-red-400";
            return <span className={`font-medium ${color}`}>{value}</span>;
        },
    },
];

const OrdersTable = () => {
    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="h-full rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
                Recent Orders
                <span className="block text-sm font-normal text-muted-foreground">
                    A quick snapshot of your latest transactions.
                </span>
            </h2>

            <div className="overflow-hidden rounded-xl border border-border/60 bg-background/50">
                <table className="min-w-full text-sm text-foreground">
                    <thead className="bg-muted/45 text-muted-foreground">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-3 text-left font-medium">
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-t border-border/50 transition hover:bg-muted/35"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((item) => (
                    <article
                        key={item.label}
                        className="rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm"
                    >
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                        <p className="mt-1 text-xs text-emerald-400">{item.delta}</p>
                    </article>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="xl:col-span-8 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
                    <h2 className="text-lg font-semibold text-foreground">
                        Revenue
                        <span className="block text-sm font-normal text-muted-foreground">
                            Last 6 months performance
                        </span>
                    </h2>
                    <SalesChart />
                </div>

                <div className="xl:col-span-4 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
                    <h2 className="mb-2 text-lg font-semibold text-foreground">
                        Device Usage
                        <span className="block text-sm font-normal text-muted-foreground">
                            How visitors visit your shop
                        </span>
                    </h2>
                    <div className="mt-8">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <defs>
                                    <filter
                                        id="shadow"
                                        x="-10%"
                                        y="-10%"
                                        width="120%"
                                        height="120%"
                                    >
                                        <feDropShadow
                                            dx="0"
                                            dy="0"
                                            stdDeviation="4"
                                            floodColor="#000"
                                            floodOpacity="0.2"
                                        />
                                    </filter>
                                </defs>

                                <Pie
                                    data={deviceData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    stroke="#0f1621"
                                    strokeWidth={2}
                                    isAnimationActive
                                    filter="url(#shadow)"
                                >
                                    {deviceData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#101926",
                                        border: "1px solid rgba(148, 163, 184, 0.15)",
                                        borderRadius: "8px",
                                    }}
                                    labelStyle={{ color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                />

                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="ml-1 text-sm text-foreground">{value}</span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="xl:col-span-7 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
                    <h2 className="mb-3 text-lg font-semibold text-foreground">
                        Visitors Distribution
                        <span className="block text-sm font-normal text-muted-foreground">
                            Visual breakdown of global visitors activity.
                        </span>
                    </h2>
                    <GeographicalMap />
                </div>

                <div className="xl:col-span-5">
                    <OrdersTable />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
