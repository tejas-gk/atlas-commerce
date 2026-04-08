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
  Search, Trash, Eye, Plus, BarChart, CalendarDays,
  ArrowUpRight, ArrowDownRight, Zap, Clock, Tag, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import useSeller from "@/hooks/useSeller";

const KPI_CARDS = [
  { label: "Active Events", value: "8", sub: "running right now", trend: "up" as const, Icon: Zap, iconCls: "bg-emerald-500/15 text-emerald-400" },
  { label: "Ending Soon", value: "3", sub: "within 48 hours", trend: "down" as const, Icon: Clock, iconCls: "bg-amber-500/15 text-amber-400" },
  { label: "Event Revenue", value: "$12,840", sub: "+14.2% this week", trend: "up" as const, Icon: TrendingUp, iconCls: "bg-emerald-500/15 text-emerald-400" },
  { label: "Avg Discount", value: "32%", sub: "across all events", trend: "up" as const, Icon: Tag, iconCls: "bg-violet-500/15 text-violet-400" },
];

const FILTER_TABS = ["All", "Active", "Upcoming", "Ended"];

const getEventStatus = (starting: string, ending: string): "Active" | "Upcoming" | "Ended" => {
  const now = Date.now();
  const start = new Date(starting).getTime();
  const end = new Date(ending).getTime();
  if (now < start) return "Upcoming";
  if (now > end) return "Ended";
  return "Active";
};

const STATUS_DOT: Record<string, string> = {
  Active: "bg-emerald-400",
  Upcoming: "bg-amber-400",
  Ended: "bg-muted-foreground/30",
};

const fetchEvents = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((i: any) => i.starting_date) ?? [];
};
const deleteProduct = async (id: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${id}`);
};
const restoreProduct = async (id: string) => {
  await axiosInstance.put(`/product/api/restore-product/${id}`);
};

export default function AllEventsPage() {
  const { seller } = useSeller();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-events", seller?.activeShopId],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-events"] }); setShowDeleteModal(false); },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-events"] }); setShowDeleteModal(false); },
  });

  const filteredData = useMemo(() => {
    if (activeTab === "All") return products;
    return products.filter((p: any) => getEventStatus(p.starting_date, p.ending_date) === activeTab);
  }, [products, activeTab]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "event",
      header: "Event",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center">
            {row.original.images?.[0]?.url
              ? <img src={row.original.images[0].url} alt={row.original.title} className="w-full h-full object-cover" />
              : <CalendarDays size={14} className="text-muted-foreground/30" />}
          </div>
          <div className="min-w-0">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-foreground/90 hover:text-emerald-400 transition-colors text-sm font-medium truncate block max-w-[180px]"
            >
              {row.original.title?.length > 28 ? `${row.original.title.substring(0, 28)}…` : row.original.title}
            </Link>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{row.original.category}</p>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }: any) => {
        const discount = row.original.regular_price && row.original.sale_price
          ? Math.round(((row.original.regular_price - row.original.sale_price) / row.original.regular_price) * 100)
          : 0;
        return (
          <div>
            <p className="text-foreground font-semibold text-sm">${row.original.sale_price}</p>
            {discount > 0 && <span className="text-[10px] text-emerald-400 font-medium">{discount}% off</span>}
          </div>
        );
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }: any) => {
        const stock = row.original.stock ?? 0;
        return (
          <span className={`text-sm tabular-nums ${stock < 10 ? "text-red-400" : "text-muted-foreground"}`}>
            {stock} left
          </span>
        );
      },
    },
    {
      id: "duration",
      header: "Duration",
      cell: ({ row }: any) => (
        <div>
          <p className="text-xs text-foreground/70">
            {new Date(row.original.starting_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            → {new Date(row.original.ending_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = getEventStatus(row.original.starting_date, row.original.ending_date);
        return (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />{status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: any) => (
        <div className="flex gap-0.5 justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" asChild>
            <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}><Eye size={14} /></Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
            onClick={() => { setAnalyticsData(row.original); setShowAnalytics(true); }}>
            <BarChart size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400"
            onClick={() => { setSelectedProduct(row.original); setShowDeleteModal(true); }}>
            <Trash size={14} />
          </Button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="seller-page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">All Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage time-limited deals and flash events</p>
        </div>
        <Button asChild size="sm" className="h-10 gap-1.5 rounded-2xl border-0 bg-[#86b81d] px-4 font-semibold text-white hover:bg-[#77a51b]">
          <Link href="/dashboard/create-event"><Plus size={14} /> Create Event</Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, sub, trend, Icon, iconCls }) => (
          <Card key={label} className="seller-kpi-card rounded-[28px] border-0 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`seller-metric-icon flex h-10 w-10 items-center justify-center rounded-[18px] shrink-0 ${iconCls}`}>
                <Icon size={16} />
              </div>
              {trend === "up"
                ? <ArrowUpRight size={14} className="text-lime-600 mt-0.5" />
                : <ArrowDownRight size={14} className="text-red-500 mt-0.5" />}
            </div>
            <p className="text-[24px] font-extrabold tracking-[-0.05em] text-[#17320f] tabular-nums leading-tight">{value}</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="seller-panel overflow-hidden rounded-[30px] border-0">
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
              placeholder="Search events…"
              className="pl-8 h-9 rounded-2xl text-sm border-[#e0e4be] bg-white"
            />
          </div>
          <p className="text-xs text-muted-foreground/50 ml-auto tabular-nums">{filteredData.length} events</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          </div>
        ) : (
          <table className="seller-table w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[#ecefd8] bg-[#fbf8eb]">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/50 font-semibold">
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f7eb] mx-auto mb-3">
                      <CalendarDays size={22} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground text-sm">No events found</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {activeTab !== "All" ? "Try a different filter" : "Create your first flash event to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#eff1df] transition-colors duration-100">
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

        {!isLoading && filteredData.length > 0 && (
          <div className="px-5 py-3 border-t border-[#ecefd8] flex items-center justify-between">
            <p className="text-xs text-muted-foreground/50">Showing {filteredData.length} of {products.length} events</p>
            <div className="flex items-center gap-3">
              {[
                { label: "Active", cls: "bg-emerald-400" },
                { label: "Upcoming", cls: "bg-amber-400" },
                { label: "Ended", cls: "bg-muted-foreground/30" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.cls}`} />{s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      {showAnalytics && analyticsData && (
        <AnalyticsModal data={analyticsData} onClose={() => setShowAnalytics(false)} />
      )}
      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          isDeleted={selectedProduct.isDeleted}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() =>
            selectedProduct.isDeleted
              ? restoreMutation.mutate(selectedProduct.id)
              : deleteMutation.mutate(selectedProduct.id)
          }
        />
      )}
    </div>
  );
}

