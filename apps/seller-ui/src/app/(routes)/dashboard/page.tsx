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
        <div className="seller-panel h-full rounded-[30px] p-5">
            <h2 className="mb-4 text-lg font-bold tracking-[-0.03em] text-foreground">
                Recent Orders
                <span className="block text-sm font-normal text-muted-foreground">
                    A quick snapshot of your latest transactions.
                </span>
            </h2>

            <div className="overflow-hidden rounded-[24px] border border-[#e0e4be] bg-white/80">
                <table className="seller-table min-w-full text-sm text-foreground">
                    <thead className="bg-[#fbf8eb] text-muted-foreground">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="p-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em]">
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
                                className="border-t transition"
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
            <section className="seller-panel overflow-hidden rounded-[34px] p-6 md:p-7">
                <div className="seller-page-header">
                    <div className="max-w-2xl space-y-3">
                        <span className="seller-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Seller overview
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-[#17320f]">
                            Fast decisions for a faster store.
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-[#586445]">
                            Stay on top of revenue, live traffic, and order flow with a brighter control room built for quick-commerce operations.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="seller-soft-panel rounded-[24px] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b7f59]">Today focus</p>
                            <p className="mt-2 text-lg font-bold text-[#17320f]">Prioritize top-moving SKUs</p>
                            <p className="mt-1 text-sm text-[#606c49]">7 items are driving most of today’s revenue.</p>
                        </div>
                        <div className="rounded-[24px] bg-[#1f3b16] px-4 py-3 text-white shadow-[0_18px_34px_rgba(31,59,22,0.16)]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">Quick win</p>
                            <p className="mt-2 text-lg font-bold">Launch a fresh discount code</p>
                            <p className="mt-1 text-sm text-white/70">The current conversion trend supports another promo push.</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((item) => (
                    <article
                        key={item.label}
                        className="seller-kpi-card rounded-[28px] p-5"
                    >
                        <p className="text-sm font-medium text-[#687257]">{item.label}</p>
                        <p className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">{item.value}</p>
                        <p className="mt-1 text-xs font-semibold text-[#76a611]">{item.delta}</p>
                    </article>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="seller-panel xl:col-span-8 rounded-[30px] p-5">
                    <h2 className="text-lg font-bold tracking-[-0.03em] text-foreground">
                        Revenue
                        <span className="block text-sm font-normal text-muted-foreground">
                            Last 6 months performance
                        </span>
                    </h2>
                    <SalesChart />
                </div>

                <div className="seller-panel xl:col-span-4 rounded-[30px] p-5">
                    <h2 className="mb-2 text-lg font-bold tracking-[-0.03em] text-foreground">
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
                                    stroke="#fff7d6"
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
                                        backgroundColor: "#fffdf4",
                                        border: "1px solid #e0e4be",
                                        borderRadius: "16px",
                                    }}
                                    labelStyle={{ color: "#17320f" }}
                                    itemStyle={{ color: "#17320f" }}
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
                <div className="seller-panel xl:col-span-7 rounded-[30px] p-5">
                    <h2 className="mb-3 text-lg font-bold tracking-[-0.03em] text-foreground">
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
