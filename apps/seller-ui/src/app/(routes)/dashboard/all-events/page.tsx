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
  { label: "Active Events", value: "8", badge: "running right now", positive: true, spark: [3, 4, 5, 4, 6, 5, 7, 6, 8, 8] },
  { label: "Ending Soon", value: "3", badge: "within 48 hours", positive: false, spark: [8, 7, 6, 7, 5, 6, 4, 5, 3, 3] },
  { label: "Event Revenue", value: "$12,840", badge: "+14.2% this week", positive: true, spark: [30, 42, 38, 55, 50, 65, 72, 80, 88, 100] },
  { label: "Avg Discount", value: "32%", badge: "across all events", positive: true, spark: [25, 27, 26, 28, 29, 28, 30, 31, 31, 32] },
];

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
              className="text-foreground/90 hover:text-emerald-600 transition-colors text-sm font-medium truncate block max-w-[180px]"
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
            {discount > 0 && <span className="text-[10px] text-emerald-600 font-medium">{discount}% off</span>}
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
          <span className={`text-sm tabular-nums ${stock < 10 ? "text-red-600" : "text-muted-foreground"}`}>
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
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600"
            onClick={() => { setAnalyticsData(row.original); setShowAnalytics(true); }}>
            <BarChart size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500"
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
        <Button asChild size="sm" className="h-10 gap-1.5 rounded-2xl border-0  px-4 font-semibold ">
          <Link href="/dashboard/create-event"><Plus size={14} /> Create Event</Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ label, value, badge, positive, spark }) => (
          <Card
            key={label}
            className="rounded-[12px] border border-[#e8ebd4] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.07)]"
          >
            <p className="text-[13px] font-medium text-[#888]">{label}</p>
            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p className="text-[2rem] font-bold leading-none tracking-tight text-[#111]">{value}</p>
              <div className="shrink-0 pb-0.5">
                <Sparkline data={spark} positive={positive} />
              </div>
            </div>
            <div className="mt-2.5">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${positive ? "bg-[#e6f9f0] text-[#16a34a]" : "bg-orange-50 text-orange-600"
                }`}>
                {positive ? "↗" : "↘"} {badge}
              </span>
            </div>
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

