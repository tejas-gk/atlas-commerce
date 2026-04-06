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
  Search, Trash, Eye, Plus, BarChart, Star, Boxes,
  ArrowUpRight, ArrowDownRight, Package, TrendingUp, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

const KPI_CARDS = [
  { label: "Total Products", value: "128", sub: "+12 this month", trend: "up" as const, Icon: Package, iconCls: "bg-rose-500/15 text-rose-400" },
  { label: "Total Revenue", value: "$48,290", sub: "+8.3% vs last month", trend: "up" as const, Icon: TrendingUp, iconCls: "bg-emerald-500/15 text-emerald-400" },
  { label: "Low Stock", value: "7", sub: "items below threshold", trend: "down" as const, Icon: AlertTriangle, iconCls: "bg-amber-500/15 text-amber-400" },
  { label: "Avg Rating", value: "4.7 / 5", sub: "across all products", trend: "up" as const, Icon: Star, iconCls: "bg-violet-500/15 text-violet-400" },
];

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
  const [globalFilter, setGlobalFilter] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
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
              className="text-foreground/90 hover:text-rose-400 transition-colors text-sm font-medium truncate block max-w-[200px]"
            >
              {row.original.title?.length > 32 ? `${row.original.title.substring(0, 32)}…` : row.original.title}
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
            <span className={`text-xs tabular-nums ${isLow ? "text-red-400" : "text-muted-foreground"}`}>{stock}</span>
          </div>
        );
      },
    },
    {
      id: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1.5">
          <Star size={12} fill="currentColor" className="text-amber-400/80" />
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
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-rose-400"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and track your product catalog</p>
        </div>
        <Button asChild size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-0 h-9 px-4 font-semibold">
          <Link href="/dashboard/create-product"><Plus size={14} /> Add Product</Link>
        </Button>
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
                className={`px-3 h-7 rounded-md text-xs font-medium transition-all duration-150 ${
                  activeTab === tab
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
              placeholder="Search products…"
              className="pl-8 h-8 text-sm border-white/[0.08] bg-white/[0.03]"
            />
          </div>
          <p className="text-xs text-muted-foreground/40 ml-auto tabular-nums">{filteredData.length} items</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-white/[0.05]">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">
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
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] mx-auto mb-3">
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
                  <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-100">
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
          <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
            <p className="text-xs text-muted-foreground/40">Showing {filteredData.length} of {products.length} products</p>
            <div className="flex items-center gap-3">
              {[
                { label: "Active", cls: "bg-emerald-400" },
                { label: "Low Stock", cls: "bg-amber-400" },
                { label: "Deleted", cls: "bg-red-400" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
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

export default function AllProductsPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-products"] }); setShowDeleteModal(false); },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-products"] }); setShowDeleteModal(false); },
  });

  const columns = useMemo(() => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: any) => (
        <img src={row.original.images?.[0]?.url} alt="product"
          className="w-11 h-11 rounded-xl object-cover border border-white/[0.06]" />
      ),
    },
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }: any) => {
        const title = row.original.title?.length > 28
          ? `${row.original.title.substring(0, 28)}…`
          : row.original.title;
        return (
          <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-rose-400 hover:text-rose-300 transition-colors text-sm font-medium">
            {title}
          </Link>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => <span className="text-rose-400 font-semibold">${row.original.sale_price}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: any) => (
        <span className={row.original.stock < 10 ? "text-red-400" : "text-muted-foreground"}>
          {row.original.stock} left
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }: any) => <span className="text-muted-foreground text-sm">{row.original.category}</span>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1 text-amber-400">
          <Star fill="currentColor" size={13} />
          <span className="text-foreground text-sm">{row.original.ratings || 5}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400" asChild>
            <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}>
              <Eye size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400"
            onClick={() => { setAnalyticsData(row.original); setShowAnalytics(true); }}>
            <BarChart size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400"
            onClick={() => { setSelectedProduct(row.original); setShowDeleteModal(true); }}>
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your product catalog</p>
        </div>
        <Button asChild size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white border-0">
          <Link href="/dashboard/create-product">
            <Plus size={15} /> Add Product
          </Link>
        </Button>
      </div>

      <Card className="border border-white/[0.06] bg-card/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search products…"
              className="pl-9 h-9 border-white/[0.08] bg-white/[0.03]"
            />
          </div>
          <span className="text-muted-foreground/50 text-xs ml-auto tabular-nums">{products.length} products</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-white/[0.05]">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium h-8">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-16">
                    <Boxes className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">No products yet</p>
                  </td></tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
