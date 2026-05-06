"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  Download,
  Package,
  Sparkles,
  Truck,
  Clock3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import useSeller from "@/hooks/useSeller";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders ?? [];
};

const KPI_CARDS = [
  {
    label: "Total Orders",
    value: "124",
    badge: "+10 this month",
    positive: true,
    spark: [40, 55, 48, 70, 60, 80, 75, 95, 88, 110],
  },
  {
    label: "Total Revenue",
    value: "$12,480",
    badge: "+5.2% vs last month",
    positive: true,
    spark: [30, 42, 38, 55, 50, 65, 60, 78, 72, 90],
  },
  {
    label: "Pending",
    value: "8",
    badge: "−2 since yesterday",
    positive: false,
    spark: [18, 22, 30, 26, 20, 15, 18, 12, 10, 8],
  },
  {
    label: "Delivered",
    value: "103",
    badge: "+8 this week",
    positive: true,
    spark: [50, 60, 55, 72, 68, 80, 78, 92, 88, 103],
  },
];

/** Inline SVG sparkline — no deps, no axes, clean trend line */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const W = 80;
  const H = 36;
  const min = Math.min(...data);
  const max = Math.max(...data);
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

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_STYLES: Record<string, string> = {
  Pending:    "bg-amber-500/10 text-amber-700 border border-amber-200/80",
  Processing: "bg-blue-500/10 text-blue-700 border border-blue-200/80",
  Shipped:    "bg-violet-500/10 text-violet-700 border border-violet-200/80",
  Delivered:  "bg-emerald-500/10 text-emerald-700 border border-emerald-200/80",
  Paid:       "bg-emerald-500/10 text-emerald-700 border border-emerald-200/80",
  Cancelled:  "bg-red-500/10 text-red-600 border border-red-200/80",
  Refunded:   "bg-slate-500/10 text-slate-600 border border-slate-200/80",
};

const STATUS_DOTS: Record<string, string> = {
  Pending:    "bg-amber-400",
  Processing: "bg-blue-400",
  Shipped:    "bg-violet-400",
  Delivered:  "bg-emerald-400",
  Paid:       "bg-emerald-400",
  Cancelled:  "bg-red-400",
  Refunded:   "bg-slate-400",
};

const AVATAR_PALETTE = [
  "bg-lime-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-600",
];

function getInitials(name: string) {
  return (name || "G")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function avatarBg(name: string) {
  const code = (name || "G").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
}

export default function OrdersPage() {
  const { seller } = useSeller();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ["seller-orders", seller?.activeShopId],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const tabCounts = useMemo(() => {
    const map: Record<string, number> = { All: allOrders.length };
    for (const tab of STATUS_TABS.slice(1)) {
      map[tab] = allOrders.filter((o: any) => o.status === tab).length;
    }
    return map;
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "All") return allOrders;
    return allOrders.filter((o: any) => o.status === activeTab);
  }, [allOrders, activeTab]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }: any) => {
        const name = row.original.user?.name ?? "Guest";
        const email = row.original.user?.email ?? "";
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarBg(name)}`}
            >
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#17320f] truncate">{name}</p>
              {email && (
                <p className="text-[11px] text-muted-foreground/50 truncate">{email}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "order",
      header: "Order ID",
      cell: ({ row }: any) => (
        <span className="font-mono text-xs tracking-wide text-[#556244] bg-[#f3f5e1] px-2 py-1 rounded-lg">
          #{row.original.id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }: any) => {
        const d = new Date(row.original.createdAt);
        return (
          <div>
            <p className="text-sm text-[#17320f] tabular-nums">
              {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="text-[11px] text-muted-foreground/40 tabular-nums">
              {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }: any) => {
        const count = Array.isArray(row.original.items)
          ? row.original.items.length
          : (row.original.itemCount ?? "—");
        return (
          <span className="text-sm text-muted-foreground tabular-nums">
            {count === "—" ? "—" : `${count} ${count === 1 ? "item" : "items"}`}
          </span>
        );
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }: any) => {
        const v = row.original.total;
        const formatted = typeof v === "number" ? v.toFixed(2) : v;
        return (
          <span className="text-sm font-semibold text-[#17320f] tabular-nums">
            ${formatted}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const s: string = row.original.status ?? "Pending";
        const cls = STATUS_STYLES[s] ?? "bg-slate-500/10 text-slate-600 border border-slate-200/80";
        const dot = STATUS_DOTS[s] ?? "bg-slate-400";
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {s}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <Link
          href={`/order/${row.original.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-transparent text-muted-foreground/40 transition-all duration-150 hover:border-[#dde1bc] hover:bg-white hover:text-[#17320f] hover:shadow-sm"
        >
          <Eye size={14} />
        </Link>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="seller-page-transition seller-compose-shell space-y-6 pb-8">
      <div className="seller-page-header">
        <div className="space-y-1.5">
          <p className="seller-section-kicker">Live Order Monitor</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] text-[#17320f]">Orders</h1>
          <BreadCrumbs title="Orders" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="seller-soft-panel rounded-2xl px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6a7b4d]">
              Fulfillment Pulse
            </p>
            <p className="text-xs text-[#55663c]">
              Live order activity and delivery progression
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-10 gap-1.5 rounded-2xl border-[#dde1bc] bg-white px-4 text-[#556244] hover:bg-[#f7f8ea] hover:text-[#17320f]"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="seller-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="seller-quick-stat">
          <Sparkles size={16} />
          <div>
            <p>Action Queue</p>
            <strong>{tabCounts.Pending ?? 0} pending orders need attention</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Truck size={16} />
          <div>
            <p>Fulfilled</p>
            <strong>{tabCounts.Delivered ?? 0} orders delivered this cycle</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Clock3 size={16} />
          <div>
            <p>Pipeline</p>
            <strong>{allOrders.length} total tracked orders in workspace</strong>
          </div>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────── */}
      <div className="seller-stagger grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, badge, positive, spark }) => (
          <Card
            key={label}
            className="seller-kpi-card rounded-[12px] p-5"
          >
            {/* label */}
            <p className="text-[13px] font-medium text-[#888]">{label}</p>

            {/* metric + sparkline row */}
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="text-[2rem] font-bold leading-none tracking-tight text-[#111]">
                {value}
              </p>
              <div className="shrink-0 pb-0.5">
                <Sparkline data={spark} positive={positive} />
              </div>
            </div>

            {/* trend badge */}
            <div className="mt-2.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  positive
                    ? "bg-[#e6f9f0] text-[#16a34a]"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {positive ? "↗" : "↘"} {badge}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Table card ──────────────────────────────────── */}
      <Card className="seller-panel seller-compose-panel overflow-hidden rounded-[30px] border-0">

        <div className="px-5 pb-2 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d9deba] bg-white/90 text-[#6c9132] shadow-[0_10px_20px_rgba(128,158,67,0.18)]">
              <Package size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#4d5d34]">Orders Ledger</h2>
              <p className="text-xs text-[#75835f]">Filter, inspect, and export order states with ease.</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="seller-toolbar space-y-3 px-5 py-3.5">

          {/* Status filter tabs */}
          <div className="flex items-center gap-0.5 rounded-2xl border border-[#e0e4be] bg-white/70 p-1 w-fit flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-8 rounded-xl px-3 text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab
                    ? "seller-tab-active"
                    : "seller-tab hover:text-foreground"
                }`}
              >
                {tab}
                {(tabCounts[tab] ?? 0) > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums leading-none ${
                      activeTab === tab
                        ? "bg-lime-100 text-lime-700"
                        : "bg-[#f0f2de] text-muted-foreground/60"
                    }`}
                  >
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search row */}
          <div className="flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
              />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search by name or order ID…"
                className="h-9 rounded-2xl border-[#e0e4be] bg-white pl-8 text-sm"
              />
            </div>
            <p className="ml-auto text-xs text-muted-foreground/50 tabular-nums">
              {table.getRowModel().rows.length} / {allOrders.length} orders
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-lime-400/30 border-t-lime-500" />
          </div>
        ) : (
          <table className="seller-table w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[#ecefd8] bg-[#faf8ec]">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f7e8]">
                      <Package size={22} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground">No orders found</p>
                    <p className="mt-1 text-xs text-muted-foreground/40">
                      {activeTab !== "All"
                        ? `No ${activeTab.toLowerCase()} orders yet`
                        : "Your customer orders will appear here"}
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#eff1df] transition-colors duration-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Footer legend */}
        {!isLoading && allOrders.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#ecefd8] px-5 py-3">
            <p className="text-xs text-muted-foreground/50">
              Showing {table.getRowModel().rows.length} of {allOrders.length} orders
            </p>
            <div className="flex items-center gap-4">
              {[
                { label: "Delivered", cls: "bg-emerald-400" },
                { label: "Pending",   cls: "bg-amber-400" },
                { label: "Processing",cls: "bg-blue-400" },
                { label: "Shipped",   cls: "bg-violet-400" },
                { label: "Cancelled", cls: "bg-red-400" },
              ].map((s) => (
                <span
                  key={s.label}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.cls}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
