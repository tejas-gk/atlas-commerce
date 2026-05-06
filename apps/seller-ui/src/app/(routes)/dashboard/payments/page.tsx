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
  CreditCard,
  Sparkles,
  Clock3,
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
            <p className="text-emerald-700 font-semibold text-sm">
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
            <p className="text-amber-600 text-sm">
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
      badge: "From completed orders",
      positive: true,
      spark: [30, 42, 38, 55, 50, 65, 60, 78, 72, 90],
    },
    {
      label: "Platform Fees",
      value: `$${displaySummary.totalAdminFees.toFixed(2)}`,
      badge: "10% platform fee",
      positive: false,
      spark: [20, 28, 24, 32, 40, 35, 42, 38, 44, 50],
    },
    {
      label: "Pending Payments",
      value: `$${displaySummary.pendingPayments.toFixed(2)}`,
      badge: "Awaiting settlement",
      positive: false,
      spark: [18, 22, 30, 26, 20, 15, 18, 12, 10, 8],
    },
    {
      label: "Completed Orders",
      value: displaySummary.completedPayments.toString(),
      badge: "Successfully paid",
      positive: true,
      spark: [50, 58, 55, 65, 62, 70, 68, 80, 78, 90],
    },
  ];

  return (
    <div className="seller-page-transition seller-compose-shell space-y-6 pb-8">
      <div className="seller-page-header">
        <div className="space-y-1.5">
          <p className="seller-section-kicker">Settlement Overview</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.055em] text-[#17320f]">Payments</h1>
          <BreadCrumbs title="Payments" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="seller-soft-panel rounded-2xl px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6a7b4d]">
              Settlement Status
            </p>
            <p className="text-xs text-[#55663c]">
              Earnings, fees, and payouts tracked in one place
            </p>
          </div>

          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
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
            <p>Net Earnings</p>
            <strong>${displaySummary.totalEarnings.toFixed(2)} seller revenue tracked</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <Clock3 size={16} />
          <div>
            <p>Pending</p>
            <strong>${displaySummary.pendingPayments.toFixed(2)} awaiting settlement</strong>
          </div>
        </div>
        <div className="seller-quick-stat">
          <CreditCard size={16} />
          <div>
            <p>Completed</p>
            <strong>{displaySummary.completedPayments} paid transactions processed</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="seller-stagger grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, badge, positive, spark }) => (
          <Card
            key={label}
            className="seller-kpi-card rounded-[12px] p-5"
          >
            <p className="text-[13px] font-medium text-[#888]">{label}</p>
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="text-[2rem] font-bold leading-none tracking-tight text-[#111]">{value}</p>
              <div className="shrink-0 pb-0.5">
                <Sparkline data={spark} positive={positive} />
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                positive ? "bg-[#e6f9f0] text-[#16a34a]" : "bg-orange-50 text-orange-600"
              }`}>
                {positive ? "↗" : "↘"} {badge}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="seller-panel seller-compose-panel overflow-hidden rounded-[30px] border-0">
        <div className="px-5 pb-2 pt-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d9deba] bg-white/90 text-[#6c9132] shadow-[0_10px_20px_rgba(128,158,67,0.18)]">
              <CreditCard size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[#4d5d34]">Payments Ledger</h2>
              <p className="text-xs text-[#75835f]">Inspect payouts, fees, status transitions, and exports.</p>
            </div>
          </div>
        </div>

        <div className="seller-toolbar flex items-center gap-3 px-5 py-4">
          <div className="flex items-center gap-0.5 rounded-2xl border border-[#e0e4be] bg-white/70 p-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-8 rounded-xl px-3 text-xs font-semibold transition-all duration-150 ${activeTab === tab
                    ? "seller-tab-active"
                    : "seller-tab hover:text-foreground"
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
              className="pl-8 h-9 rounded-2xl text-sm border-[#e0e4be] bg-white"
            />
          </div>
          <p className="ml-auto text-xs text-muted-foreground/50 tabular-nums">{filteredData.length} transactions</p>
        </div>

        {isLoading || summaryLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          </div>
        ) : (
          <>
            <table className="seller-table w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-[#ecefd8] bg-[#fbf8eb]">
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-semibold">
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
                    <tr key={row.id} className="border-b border-[#eff1df] transition-colors duration-100">
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
              <div className="px-5 py-3 border-t border-[#ecefd8] flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50">
                  Page {currentPage + 1} of {table.getPageCount()} • Showing {table.getRowModel().rows.length} of {filteredData.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 w-8 rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]"
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 w-8 rounded-2xl border-[#dde1bc] bg-white hover:bg-[#f6f8ea]"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Status Legend */}
            {filteredData.length > 0 && (
              <div className="px-5 py-3 border-t border-[#ecefd8] flex items-center justify-end">
                <div className="flex items-center gap-3">
                  {[
                    { label: "Paid", cls: "bg-emerald-400" },
                    { label: "Pending", cls: "bg-amber-400" },
                    { label: "Failed", cls: "bg-red-400" },
                    { label: "Refunded", cls: "bg-slate-400" },
                  ].map((s) => (
                    <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
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
