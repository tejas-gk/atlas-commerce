"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import BreadCrumbs from "@/shared/components/breadcrumbs";
import useSeller from "@/hooks/useSeller";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";

// Types
interface Order {
  id: string;
  total: number;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
  paymentMethod?: string;
  transactionId?: string;
}

interface PaymentSummary {
  totalEarnings: number;
  totalAdminFees: number;
  pendingPayments: number;
  completedPayments: number;
}

const FILTER_TABS = ["All", "Paid", "Pending", "Failed", "Refunded"];

const fetchOrders = async (shopId: string): Promise<Order[]> => {
  const res = await axiosInstance.get("/order/api/get-seller-orders", {
    params: { shopId }
  });
  return res.data.orders;
};

const fetchPaymentSummary = async (shopId: string): Promise<PaymentSummary> => {
  const res = await axiosInstance.get("/order/api/get-payment-summary", {
    params: { shopId }
  });
  return res.data;
};

const SellerPayments = () => {
  const { seller } = useSeller();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders", seller?.activeShopId],
    queryFn: () => fetchOrders(seller?.activeShopId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  // Fetch payment summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["payment-summary", seller?.activeShopId],
    queryFn: () => fetchPaymentSummary(seller?.activeShopId!),
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  // Filter orders by status
  const filteredData = useMemo(() => {
    if (activeTab === "All") return orders;
    return orders.filter(order => order.status === activeTab);
  }, [orders, activeTab]);

  // Calculate summary from actual data if API not available
  const calculatedSummary = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === "Paid");
    const totalEarnings = paidOrders.reduce((sum, o) => sum + o.total * 0.9, 0);
    const totalAdminFees = paidOrders.reduce((sum, o) => sum + o.total * 0.1, 0);
    const pendingPayments = orders.filter(o => o.status === "Pending").reduce((sum, o) => sum + o.total * 0.9, 0);

    return {
      totalEarnings,
      totalAdminFees,
      pendingPayments,
      completedPayments: paidOrders.length,
    };
  }, [orders]);

  const displaySummary = summary || calculatedSummary;

  // Export to CSV
  const handleExport = () => {
    const headers = ["Order ID", "Buyer", "Amount", "Seller Earning", "Admin Fee", "Status", "Date"];
    const csvData = filteredData.map(order => [
      `#${order.id.slice(-6).toUpperCase()}`,
      order.user?.name || "Guest",
      `$${order.total.toFixed(2)}`,
      `$${(order.total * 0.9).toFixed(2)}`,
      `$${(order.total * 0.1).toFixed(2)}`,
      order.status,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      id: "order",
      header: "Order Details",
      cell: ({ row }: any) => (
        <div className="min-w-0">
          <p className="text-foreground/90 text-sm font-mono font-medium">
            #{row.original.id.slice(-8).toUpperCase()}
          </p>
          <p className="text-[11px] text-muted-foreground/50 mt-0.5">
            {row.original.user?.name || "Guest"}
          </p>
          <p className="text-[10px] text-muted-foreground/40">
            {row.original.user?.email || ""}
          </p>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: ({ row }: any) => (
        <div>
          <p className="text-foreground font-semibold text-sm">
            ${row.original.total.toFixed(2)}
          </p>
          {row.original.transactionId && (
            <p className="text-[10px] text-muted-foreground/40 mt-0.5 font-mono">
              TX: {row.original.transactionId.slice(-6)}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "earnings",
      header: "Your Earnings",
      cell: ({ row }: any) => {
        const sellerShare = row.original.total * 0.9;
        return (
          <div>
            <p className="text-emerald-400 font-semibold text-sm">
              ${sellerShare.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">
              90% of total
            </p>
          </div>
        );
      },
    },
    {
      id: "fee",
      header: "Platform Fee",
      cell: ({ row }: any) => {
        const adminFee = row.original.total * 0.1;
        return (
          <div>
            <p className="text-amber-400/80 text-sm">
              ${adminFee.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">
              10% fee
            </p>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const statusConfig = {
          Paid: { color: "bg-emerald-400", text: "Paid" },
          Pending: { color: "bg-amber-400", text: "Pending" },
          Failed: { color: "bg-red-400", text: "Failed" },
          Refunded: { color: "bg-slate-400", text: "Refunded" },
        };
        const config = statusConfig[row.original.status as keyof typeof statusConfig] || statusConfig.Pending;

        return (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${config.color}`} />
            {config.text}
          </span>
        );
      },
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return (
          <div>
            <p className="text-foreground/80 text-sm">
              {date.toLocaleDateString()}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex gap-0.5 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={`/order/${row.original.id}`}>
              <Eye size={14} />
            </Link>
          </Button>
          {row.original.status === "Paid" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => window.open(`/invoice/${row.original.id}`, "_blank")}
            >
              <Download size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function'
        ? updater({ pageIndex: currentPage, pageSize })
        : updater;
      setCurrentPage(newState.pageIndex);
    },
  });

  const KPI_CARDS = [
    {
      label: "Total Earnings",
      value: `$${displaySummary.totalEarnings.toFixed(2)}`,
      sub: "From completed orders",
      trend: "up" as const,
      Icon: DollarSign,
      iconCls: "bg-emerald-500/15 text-emerald-400"
    },
    {
      label: "Platform Fees",
      value: `$${displaySummary.totalAdminFees.toFixed(2)}`,
      sub: "10% platform fee",
      trend: "down" as const,
      Icon: CreditCard,
      iconCls: "bg-amber-500/15 text-amber-400"
    },
    {
      label: "Pending Payments",
      value: `$${displaySummary.pendingPayments.toFixed(2)}`,
      sub: "Awaiting settlement",
      trend: "down" as const,
      Icon: Clock,
      iconCls: "bg-rose-500/15 text-rose-400"
    },
    {
      label: "Completed Orders",
      value: displaySummary.completedPayments.toString(),
      sub: "Successfully paid",
      trend: "up" as const,
      Icon: CheckCircle,
      iconCls: "bg-violet-500/15 text-violet-400"
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your earnings and transaction history</p>
        </div>
        <BreadCrumbs title="Payments" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, trend, Icon, iconCls }) => (
          <Card key={label} className="border border-white/[0.08] bg-card/50 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${iconCls}`}>
                <Icon size={16} />
              </div>
              {trend === "up"
                ? <ArrowUpRight size={14} className="text-emerald-400 mt-0.5" />
                : <ArrowDownRight size={14} className="text-red-400 mt-0.5" />}
            </div>
            <p className="text-[22px] font-semibold tabular-nums leading-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">{sub}</p>
            <p className="text-[11px] text-muted-foreground/40 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="border border-white/[0.06] bg-card/50 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.05]">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-all duration-150 ${activeTab === tab
                    ? "bg-card text-foreground border border-white/[0.08] shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by order ID, buyer name, or email..."
              className="pl-8 h-8 text-sm border-white/[0.08] bg-white/[0.03]"
            />
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 px-3 text-xs border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] ml-auto"
          >
            <Download size={13} />
            Export CSV
          </Button>
          <p className="text-xs text-muted-foreground/40 tabular-nums">{filteredData.length} transactions</p>
        </div>

        {isLoading || summaryLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-white/[0.05]">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
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
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-20">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] mx-auto mb-3">
                        <CreditCard size={22} className="text-muted-foreground/30" />
                      </div>
                      <p className="text-muted-foreground text-sm">No payments found</p>
                      <p className="text-xs text-muted-foreground/40 mt-1">
                        {activeTab !== "All" ? "Try a different filter" : "No transactions yet"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-3.5">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
                <p className="text-xs text-muted-foreground/40">
                  Page {currentPage + 1} of {table.getPageCount()} • Showing {table.getRowModel().rows.length} of {filteredData.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-7 w-7 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-7 w-7 border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Status Legend */}
            {filteredData.length > 0 && (
              <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-end">
                <div className="flex items-center gap-3">
                  {[
                    { label: "Paid", cls: "bg-emerald-400" },
                    { label: "Pending", cls: "bg-amber-400" },
                    { label: "Failed", cls: "bg-red-400" },
                    { label: "Refunded", cls: "bg-slate-400" },
                  ].map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                      <span className={`h-1.5 w-1.5 rounded-full ${s.cls}`} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default SellerPayments;