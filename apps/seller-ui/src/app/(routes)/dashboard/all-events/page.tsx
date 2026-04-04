"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Trash, Eye, Plus, BarChart, Star } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";
import AnalyticsModal from "@/shared/components/modals/analytics.modal";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

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
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["shop-events"],
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-events"] }); setShowDeleteModal(false); },
  });
  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shop-events"] }); setShowDeleteModal(false); },
  });

  const columns = useMemo(() => [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: any) => (
        <Image src={row.original.images?.[0]?.url} alt="event"
          width={44} height={44}
          className="w-11 h-11 rounded-xl object-cover border border-white/10" />
      ),
    },
    {
      accessorKey: "name",
      header: "Event",
      cell: ({ row }: any) => {
        const title = row.original.title?.length > 28
          ? `${row.original.title.substring(0, 28)}…`
          : row.original.title;
        return (
          <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
            className="text-violet-400 hover:text-violet-300 transition-colors text-sm font-medium">
            {title}
          </Link>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: any) => <span className="text-violet-300 font-semibold">${row.original.sale_price}</span>,
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: any) => (
        <span className={row.original.stock < 10 ? "text-red-400" : "text-white/70"}>
          {row.original.stock} left
        </span>
      ),
    },
    {
      accessorKey: "starting_date",
      header: "Start Date",
      cell: ({ row }: any) => (
        <span className="text-white/70 text-sm font-medium">
          {new Date(row.original.starting_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: "ending_date",
      header: "End Date",
      cell: ({ row }: any) => (
        <span className="text-white/50 text-sm">
          {new Date(row.original.ending_date).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-violet-400 hover:bg-violet-500/10" asChild>
            <Link href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}>
              <Eye size={16} />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-violet-400 hover:bg-violet-500/10"
            onClick={() => { setAnalyticsData(row.original); setShowAnalytics(true); }}>
            <BarChart size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-500/5"
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">All Events</h1>
          <p className="text-white/35 text-sm mt-0.5">Manage time-limited deals and flash events</p>
        </div>
        <Link href="/dashboard/create-event"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold shadow-[0_0_15px_rgba(124,58,237,0.35)] transition-all">
          <Plus size={15} /> Create Event
        </Link>
      </div>

      <Card className="bg-white/5 border-white/8 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search events…"
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-violet-500 h-9"
            />
          </div>
          <span className="text-white/30 text-xs ml-auto">{products.length} events</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-white/5">
                  {hg.headers.map((h) => (
                    <th key={h.id} className="text-left px-5 py-3 text-white/30 text-[11px] font-semibold uppercase tracking-wider">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center py-16 text-white/25 text-sm">No events yet</td></tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
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
