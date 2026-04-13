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
  Search, Trash, Eye, Plus, BarChart, Package, Star, Boxes,
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
  { label: "Total Products", value: "128", badge: "+12 this month", positive: true, spark: [60, 72, 68, 80, 75, 88, 84, 95, 92, 105] },
  { label: "Total Revenue", value: "$48,290", badge: "+8.3% vs last month", positive: true, spark: [30, 42, 38, 55, 50, 65, 60, 78, 72, 90] },
  { label: "Low Stock", value: "7", badge: "items below threshold", positive: false, spark: [4, 6, 5, 8, 10, 9, 12, 10, 8, 7] },
  { label: "Avg Rating", value: "4.7 / 5", badge: "across all products", positive: true, spark: [40, 42, 44, 43, 45, 44, 46, 46, 47, 47] },
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

const FILTER_TABS = ["All", "Active", "Low Stock", "Deleted"];

const fetchProducts = async () => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res.data.products?.filter((i: any) => !i.starting_date) ?? [];
};
const deleteProduct = async (id: string) => {
  await axiosInstance.delete(`/product/api/delete-product/${id}`);
};
const restoreProduct = async (id: string) => {
  await axiosInstance.put(`/product/api/restore-product/${id}`);
};

export default function AllProductsPage() {
  const { seller } = useSeller();
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products", seller?.activeShopId],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-products"] }); setShowDeleteModal(false); },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-products"] }); setShowDeleteModal(false); },
  });

  const filteredData = useMemo(() => {
    if (activeTab === "Low Stock") return products.filter((p: any) => p.stock < 10);
    if (activeTab === "Deleted") return products.filter((p: any) => p.isDeleted);
    if (activeTab === "Active") return products.filter((p: any) => !p.isDeleted);
    return products;
  }, [products, activeTab]);

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "product",
      header: "Product",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center">
            {row.original.images?.[0]?.url
              ? <img src={row.original.images[0].url} alt={row.original.title} className="w-full h-full object-cover" />
              : <Package size={14} className="text-muted-foreground/30" />}
          </div>
          <div className="min-w-0">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-foreground/90 hover:text-emerald-600 transition-colors text-sm font-medium truncate block max-w-[200px]"
            >
              {row.original.title?.length > 32 ? `${row.original.title.substring(0, 32)}...` : row.original.title}
            </Link>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{row.original.category}</p>
          </div>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }: any) => (
        <div>
          <p className="text-foreground font-semibold text-sm">${row.original.sale_price}</p>
          {row.original.regular_price > row.original.sale_price && (
            <p className="text-muted-foreground/40 text-xs line-through">${row.original.regular_price}</p>
          )}
        </div>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }: any) => {
        const stock = row.original.stock ?? 0;
        const isLow = stock < 10;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-14 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-emerald-400"}`}
                style={{ width: `${Math.min(100, (stock / 100) * 100)}%` }}
              />
            </div>
            <span className={`text-xs tabular-nums ${isLow ? "text-red-600" : "text-muted-foreground"}`}>{stock}</span>
          </div>
        );
      },
    },
    {
      id: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          <Star size={12} fill="currentColor" className="text-amber-500" />
          <span className="text-foreground/80 text-sm tabular-nums">{row.original.ratings || "5.0"}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }: any) => {
        if (row.original.isDeleted)
          return <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />Deleted</span>;
        if (row.original.stock < 10)
          return <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Low Stock</span>;
        return <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Active</span>;
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
      <div className="seller-page-header">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">All Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track your product catalog</p>
        </div>
        <Button asChild size="sm" className="h-10 gap-1.5 rounded-2xl border-0 bg-[#86b81d] px-4 font-semibold text-white hover:bg-[#77a51b]">
          <Link href="/dashboard/create-product"><Plus size={14} /> Add Product</Link>
        </Button>
      </div>

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
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                positive ? "bg-[#e6f9f0] text-[#16a34a]" : "bg-orange-50 text-orange-600"
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
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search products..."
              className="h-9 rounded-2xl border-[#e0e4be] bg-white pl-8 text-sm"
            />
          </div>
          <p className="ml-auto text-xs text-muted-foreground/50 tabular-nums">{filteredData.length} items</p>
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
                    <th key={h.id} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
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
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f7eb]">
                      <Boxes size={22} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground text-sm">No products found</p>
                    <p className="text-xs text-muted-foreground/40 mt-1">
                      {activeTab !== "All" ? "Try a different filter" : "Add your first product to get started"}
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
          <div className="flex items-center justify-between border-t border-[#ecefd8] px-5 py-3">
            <p className="text-xs text-muted-foreground/50">Showing {filteredData.length} of {products.length} products</p>
            <div className="flex items-center gap-3">
              {[
                { label: "Active", cls: "bg-emerald-400" },
                { label: "Low Stock", cls: "bg-amber-400" },
                { label: "Deleted", cls: "bg-red-400" },
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

