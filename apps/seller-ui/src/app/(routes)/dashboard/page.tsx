"use client";

import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SalesChart } from "@/shared/components/charts/sales.chart";
import GeographicalMap from "@/shared/components/charts/geographicalMap";
import { ArrowRight, CalendarDays, Zap, Star } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import Link from "next/link";

// ─── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
    const W = 80, H = 36;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * W;
            const y = H - ((v - min) / range) * H;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    const color = positive ? "#22c55e" : "#f97316";
    return (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
            <polyline points={pts} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

// ─── Data ───────────────────────────────────────────────────────────────────────────────
const KPI_METRICS = [
    {
        label: "Gross Revenue", value: "$82,410", positive: true,
        spark: [52, 58, 55, 63, 70, 65, 74, 78, 77, 82],
        meta: [{ k: "Last month", v: "$72.1k" }, { k: "Growth", v: "+14.2%" }],
    },
    {
        label: "Conversion Rate", value: "3.78%", positive: true,
        spark: [3.1, 3.2, 3.0, 3.3, 3.5, 3.4, 3.6, 3.7, 3.8, 3.78],
        meta: [{ k: "Last week", v: "3.18%" }, { k: "vs avg", v: "+0.6%" }],
    },
    {
        label: "New Customers", value: "1,248", positive: true,
        spark: [890, 920, 950, 980, 1020, 1050, 1100, 1150, 1200, 1248],
        meta: [{ k: "Last month", v: "1,114" }, { k: "Growth", v: "+12%" }],
    },
    {
        label: "Avg. Order Value", value: "$64.90", positive: true,
        spark: [62, 64, 63, 65, 64, 66, 65, 64, 65, 64.9],
        meta: [{ k: "Last month", v: "$63.40" }, { k: "Trend", v: "Stable" }],
    },
];

const deviceData = [
    { name: "Phone",    value: 55 },
    { name: "Computer", value: 25 },
    { name: "Tablet",   value: 20 },
];
const DEVICE_COLORS = ["#34d399", "#60a5fa", "#facc15"];

const TOP_PRODUCTS = [
    { name: "Wireless Earbuds Pro",  revenue: "$12,840", units: 214, rating: 4.8 },
    { name: "Leather Crossbody Bag", revenue: "$9,320",  units: 156, rating: 4.6 },
    { name: "Smart Fitness Tracker", revenue: "$7,990",  units: 132, rating: 4.7 },
    { name: "Minimalist Desk Lamp",  revenue: "$5,410",  units: 98,  rating: 4.5 },
    { name: "Organic Face Serum",    revenue: "$4,880",  units: 87,  rating: 4.9 },
];

const orders = [
    { id: "ORD-001", customer: "John Doe",      amount: "$250", status: "Paid",    time: "2m ago"  },
    { id: "ORD-002", customer: "Jane Smith",    amount: "$180", status: "Pending", time: "18m ago" },
    { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid",    time: "45m ago" },
    { id: "ORD-004", customer: "Marcus Chen",   amount: "$90",  status: "Failed",  time: "1h ago"  },
    { id: "ORD-005", customer: "Priya Patel",   amount: "$520", status: "Paid",    time: "2h ago"  },
    { id: "ORD-006", customer: "Tyler Brooks",  amount: "$140", status: "Pending", time: "3h ago"  },
];

const STATUS_STYLE: Record<string, string> = {
    Paid:    "bg-[#e6f9f0] text-[#16a34a]",
    Pending: "bg-amber-50 text-amber-600",
    Failed:  "bg-red-50 text-red-500",
};

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
    "bg-[#e8ebd4] text-[#17320f]", "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700", "bg-teal-100 text-teal-700",
];

const columns = [
    {
        accessorKey: "id",
        header: "Order",
        cell: ({ getValue }: any) => (
            <span className="font-mono text-[11px] text-muted-foreground">{getValue()}</span>
        ),
    },
    {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ getValue, row }: any) => {
            const name = getValue() as string;
            return (
                <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${AVATAR_COLORS[row.index % AVATAR_COLORS.length]}`}>
                        {initials(name)}
                    </div>
                    <span className="text-[13px] font-medium text-[#17320f]">{name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }: any) => (
            <span className="text-[13px] font-semibold text-[#111]">{getValue()}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: any) => {
            const v = getValue() as string;
            return (
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[v] ?? ""}`}>
                    {v}
                </span>
            );
        },
    },
    {
        accessorKey: "time",
        header: "",
        cell: ({ getValue }: any) => (
            <span className="text-[11px] text-muted-foreground/50">{getValue()}</span>
        ),
    },
];

const PERIODS = ["1W", "1M", "3M", "6M", "1Y"];

// ─── Orders Table ─────────────────────────────────────────────────────────────
const OrdersTable = () => {
    const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });
    return (
        <Card className="rounded-[16px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#17320f]">Recent Orders</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">Latest transactions at a glance</p>
                </div>
                <Link href="/dashboard/orders" className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-[#86b81d] hover:bg-[#f0f4d8] transition-colors">
                    View all <ArrowRight size={11} />
                </Link>
            </div>
            <div className="overflow-hidden rounded-[12px] border border-[#f0f2e0]">
                <table className="min-w-full text-sm">
                    <thead className="border-b border-[#f0f2e0] bg-[#fafbf5]">
                        {table.getHeaderGroups().map((hg) => (
                            <tr key={hg.id}>
                                {hg.headers.map((h) => (
                                    <th key={h.id} className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-t border-[#f5f6ee] hover:bg-[#fafbf5] transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-3 py-2.5">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const DashboardPage = () => {
    const [period, setPeriod] = useState("1M");
    const [activeDeviceIdx, setActiveDeviceIdx] = useState(-1);
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

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {KPI_METRICS.map(({ label, value, positive, spark, meta }) => (
                    <Card key={label} className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                        <p className="text-[13px] font-medium text-[#888]">{label}</p>
                        <div className="mt-1.5 flex items-end justify-between gap-2">
                            <p className="text-[2rem] font-bold leading-none tracking-tight text-[#111]">{value}</p>
                            <div className="shrink-0 pb-0.5"><Sparkline data={spark} positive={positive} /></div>
                        </div>
                        <div className="mt-2.5 flex items-center gap-4 border-t border-[#f4f5ec] pt-2.5">
                            {meta.map(({ k, v }) => (
                                <div key={k}>
                                    <p className="text-[10px] text-muted-foreground leading-none">{k}</p>
                                    <p className="text-[12px] font-semibold text-[#17320f] mt-0.5 leading-none">{v}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue + Device */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <Card className="xl:col-span-8 rounded-[16px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#17320f]">Revenue</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">Last 6 months performance</p>
                        </div>
                        <div className="flex items-center gap-0.5 rounded-xl border border-[#e8ebd4] bg-[#fafbf5] p-1">
                            {PERIODS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`h-7 rounded-lg px-3 text-[11px] font-semibold transition-all ${
                                        period === p ? "bg-[#17320f] text-white shadow-sm" : "text-muted-foreground hover:text-[#17320f]"
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SalesChart />
                </Card>

                <Card className="xl:col-span-4 rounded-[16px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                    <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#17320f]">Device Usage</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">How visitors reach your shop</p>
                    <div className="relative mt-2">
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <defs>
                                    <filter id="pie-shadow" x="-10%" y="-10%" width="120%" height="120%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                                    </filter>
                                </defs>
                                <Pie
                                    data={deviceData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={52} outerRadius={75}
                                    paddingAngle={3} stroke="none" isAnimationActive
                                    activeIndex={activeDeviceIdx}
                                    activeOuterRadiusOffset={8}
                                    onMouseEnter={(_: any, i: number) => setActiveDeviceIdx(i)}
                                    onMouseLeave={() => setActiveDeviceIdx(-1)}
                                >
                                    {deviceData.map((_, i) => (
                                        <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#fffdf4", border: "1px solid #e0e4be", borderRadius: "12px", fontSize: "12px" }}
                                    formatter={(v: any) => [`${v}%`, ""]}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-[10px] text-muted-foreground leading-none transition-all">
                                {activeDeviceIdx >= 0 ? deviceData[activeDeviceIdx].name : "All devices"}
                            </p>
                            <p className="text-[20px] font-bold text-[#17320f] leading-tight transition-all">
                                {activeDeviceIdx >= 0 ? `${deviceData[activeDeviceIdx].value}%` : "100%"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 space-y-2">
                        {deviceData.map(({ name, value }, i) => (
                            <div
                                key={name}
                                onMouseEnter={() => setActiveDeviceIdx(i)}
                                onMouseLeave={() => setActiveDeviceIdx(-1)}
                                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors cursor-default ${
                                    activeDeviceIdx === i ? "bg-[#f5f7ec]" : "hover:bg-[#fafbf5]"
                                }`}
                            >
                                <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: DEVICE_COLORS[i] }} />
                                <p className={`w-20 text-[12px] transition-colors ${
                                    activeDeviceIdx === i ? "font-semibold text-[#17320f]" : "text-muted-foreground"
                                }`}>{name}</p>
                                <div className="flex-1 h-1.5 rounded-full bg-[#f0f2e0] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-200"
                                        style={{
                                            width: `${value}%`,
                                            backgroundColor: DEVICE_COLORS[i],
                                            opacity: activeDeviceIdx < 0 || activeDeviceIdx === i ? 1 : 0.35,
                                        }}
                                    />
                                </div>
                                <p className={`w-8 text-right text-[12px] font-semibold transition-colors ${
                                    activeDeviceIdx === i ? "text-[#17320f]" : "text-muted-foreground"
                                }`}>{value}%</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Top Products + Map */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
                <Card className="xl:col-span-4 rounded-[16px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#17320f]">Top Products</h2>
                            <p className="mt-0.5 text-xs text-muted-foreground">Best performers this month</p>
                        </div>
                        <Link href="/dashboard/all-products" className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold text-[#86b81d] hover:bg-[#f0f4d8] transition-colors">
                            View all <ArrowRight size={11} />
                        </Link>
                    </div>
                    <div className="space-y-1">
                        {TOP_PRODUCTS.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#fafbf5] transition-colors">
                                <span className="w-4 shrink-0 text-[11px] font-bold text-muted-foreground/40">{i + 1}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-[#17320f]">{p.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{p.units} units</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-[13px] font-bold text-[#111]">{p.revenue}</p>
                                    <div className="mt-0.5 flex items-center justify-end gap-0.5">
                                        <Star size={9} fill="#f59e0b" stroke="none" />
                                        <p className="text-[10px] text-muted-foreground">{p.rating}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="xl:col-span-8 rounded-[16px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                    <div className="mb-3">
                        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-[#17320f]">Visitors Distribution</h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">Visual breakdown of global visitor activity</p>
                    </div>
                    <GeographicalMap />
                </Card>
            </div>

            {/* Recent Orders */}
            <OrdersTable />

        </div>
    );
};

export default DashboardPage;
