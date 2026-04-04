"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders ?? [];
};

const statusBadgeClass = (status: string) => {
  if (status === "Paid")   return "bg-emerald-500/10 text-emerald-400 border-0";
  if (status === "Failed") return "bg-red-500/10 text-red-400 border-0";
  return "bg-amber-500/10 text-amber-400 border-0";
};

export default function OrdersPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }: any) => (
        <span className="text-white/50 text-xs font-mono">#{row.original.id.slice(-6).toUpperCase()}</span>
      ),
    },
    {
      accessorKey: "user.name",
      header: "Buyer",
      cell: ({ row }: any) => <span className="text-white text-sm">{row.original.user?.name ?? "Guest"}</span>,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: any) => <span className="text-violet-300 font-semibold">${row.original.total}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={`text-[11px] font-semibold ${statusBadgeClass(row.original.status)}`}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) => (
        <span className="text-white/40 text-xs">{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <Button variant="ghost" size="icon" asChild className="h-7 w-7 hover:text-violet-400 hover:bg-transparent text-white/50">
          <Link href={`/order/${row.original.id}`}><Eye size={15} /></Link>
        </Button>
      ),
    },
  ], []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Orders</h1>
        <p className="text-white/35 text-sm mt-0.5">Manage and track all your orders</p>
      </div>

      <Card className="bg-white/5 border-white/8 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search orders…"
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 h-9"
            />
          </div>
          <span className="text-white/30 text-xs ml-auto">{orders.length} orders</span>
        </div>

        {/* Table */}
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
                <tr>
                  <td colSpan={columns.length} className="text-center py-16 text-white/25 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
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
      </Card>
    </div>
  );
}
