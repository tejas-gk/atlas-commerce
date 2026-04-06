"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

// -- Types --

type OrderStatus = "Delivered" | "Processing" | "Shipped" | "Cancelled" | "Pending";

interface Order {
  id: string;
  buyer: string;
  email: string;
  avatar: string;
  items: number;
  total: number;
  status: OrderStatus;
  method: string;
  date: string;
}

// -- Mock data --

const mockOrders: Order[] = [
  { id: "ORD-7891", buyer: "Sarah Chen", email: "sarah@example.com", avatar: "SC", items: 3, total: 284.00, status: "Delivered", method: "Credit Card", date: "2026-04-06" },
  { id: "ORD-7890", buyer: "Marcus Johnson", email: "marcus@example.com", avatar: "MJ", items: 1, total: 59.99, status: "Processing", method: "PayPal", date: "2026-04-06" },
  { id: "ORD-7889", buyer: "Aisha Patel", email: "aisha@example.com", avatar: "AP", items: 5, total: 412.50, status: "Shipped", method: "Credit Card", date: "2026-04-05" },
  { id: "ORD-7888", buyer: "Liam O'Brien", email: "liam@example.com", avatar: "LO", items: 2, total: 129.00, status: "Cancelled", method: "Stripe", date: "2026-04-05" },
  { id: "ORD-7887", buyer: "Yuki Tanaka", email: "yuki@example.com", avatar: "YT", items: 1, total: 89.99, status: "Delivered", method: "Apple Pay", date: "2026-04-04" },
  { id: "ORD-7886", buyer: "Emma Wilson", email: "emma@example.com", avatar: "EW", items: 4, total: 356.80, status: "Pending", method: "Credit Card", date: "2026-04-04" },
  { id: "ORD-7885", buyer: "David Kim", email: "david@example.com", avatar: "DK", items: 2, total: 175.00, status: "Shipped", method: "PayPal", date: "2026-04-03" },
  { id: "ORD-7884", buyer: "Olivia Brown", email: "olivia@example.com", avatar: "OB", items: 6, total: 523.40, status: "Delivered", method: "Credit Card", date: "2026-04-03" },
  { id: "ORD-7883", buyer: "James Lee", email: "james@example.com", avatar: "JL", items: 1, total: 44.99, status: "Processing", method: "Stripe", date: "2026-04-02" },
  { id: "ORD-7882", buyer: "Nina Garcia", email: "nina@example.com", avatar: "NG", items: 3, total: 198.50, status: "Delivered", method: "Credit Card", date: "2026-04-01" },
];

// -- Status config --

const statusConfig: Record<OrderStatus, { dot: string; badge: string }> = {
  Delivered:  { dot: "bg-emerald-400", badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  Processing: { dot: "bg-amber-400",   badge: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  Shipped:    { dot: "bg-blue-400",    badge: "border-blue-500/20 bg-blue-500/10 text-blue-400" },
  Cancelled:  { dot: "bg-red-400",     badge: "border-red-500/20 bg-red-500/10 text-red-400" },
  Pending:    { dot: "bg-slate-400",   badge: "border-slate-500/20 bg-slate-500/10 text-slate-400" },
};

const summaryStats = [
  { label: "Total Orders", value: "2,847", change: "+12.5%", up: true, icon: ShoppingCart, bg: "bg-rose-500/15", iconColor: "text-rose-400" },
  { label: "Delivered", value: "2,103", change: "+8.2%", up: true, icon: CheckCircle2, bg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
  { label: "Processing", value: "342", change: "-3.1%", up: false, icon: Clock, bg: "bg-amber-500/15", iconColor: "text-amber-400" },
  { label: "Cancelled", value: "48", change: "-24%", up: true, icon: XCircle, bg: "bg-red-500/15", iconColor: "text-red-400" },
];

const filterTabs = [
  { label: "All Orders", value: "all" },
  { label: "Delivered", value: "Delivered" },
  { label: "Processing", value: "Processing" },
  { label: "Shipped", value: "Shipped" },
  { label: "Pending", value: "Pending" },
  { label: "Cancelled", value: "Cancelled" },
];

// -- Page --

export default function OrdersPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    let result: Order[] = mockOrders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.buyer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [statusFilter, globalFilter]);

  const columns: ColumnDef<Order>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
              <Package className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">{row.original.id}</p>
              <p className="text-[11px] text-muted-foreground/60">{row.original.items} item{row.original.items > 1 ? "s" : ""}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "buyer",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-muted-foreground">
              {row.original.avatar}
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground/90">{row.original.buyer}</p>
              <p className="text-[11px] text-muted-foreground/50">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ row }) => (
          <span className="text-[13px] font-semibold tabular-nums">${row.original.total.toFixed(2)}</span>
        ),
      },
      {
        accessorKey: "method",
        header: "Payment",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground">{row.original.method}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const cfg = statusConfig[row.original.status];
          return (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-md",
                cfg.badge
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-[12px] text-muted-foreground/70 tabular-nums">
            {new Date(row.original.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
          >
            <Link href={`/order/${row.original.id}`}>
              <Eye size={15} />
            </Link>
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage and track all your orders
        </p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => (
          <Card key={stat.label} className="border border-white/[0.08] bg-card/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-muted-foreground/60 truncate">{stat.label}</p>
                  <span className={cn(
                    "inline-flex items-center text-[10px] font-medium",
                    stat.up ? "text-emerald-400" : "text-red-400"
                  )}>
                    {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border border-white/[0.08] bg-card/50 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
              />
              <Input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search orders..."
                className="pl-9 h-9 border-white/[0.08] bg-white/[0.03] text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
              </span>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/[0.08] text-muted-foreground hover:text-foreground">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 -mb-3 -mx-5 px-5 border-b border-white/[0.06]">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "px-3 py-2 text-[12px] font-medium transition-colors relative",
                  statusFilter === tab.value
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                )}
              >
                {tab.label}
                {statusFilter === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rose-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-white/[0.06]">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium"
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
                  <td colSpan={columns.length} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground/60">No orders found</p>
                        <p className="text-[12px] text-muted-foreground/40 mt-0.5">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <p className="text-[11px] text-muted-foreground/40">
            Showing {filteredOrders.length} of {mockOrders.length} orders
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] text-muted-foreground/60" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] bg-white/[0.04] text-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] text-muted-foreground/60">
              2
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] text-muted-foreground/60">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}