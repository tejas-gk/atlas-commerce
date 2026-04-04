"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Search, Eye, TrendingUp, DollarSign, Percent } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders ?? [];
};

const statusBadgeClass = (status: string) => {
  if (status === "Paid")   return "bg-emerald-500/10 text-emerald-400 border-0";
  if (status === "Failed") return "bg-red-500/10 text-red-400 border-0";
  return "bg-amber-500/10 text-amber-400 border-0";
};

export default function PaymentsPage() {
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const totalEarnings = useMemo(() =>
    orders.reduce((sum: number, o: any) => sum + (o.total * 0.9), 0), [orders]);
  const totalFees = useMemo(() =>
    orders.reduce((sum: number, o: any) => sum + (o.total * 0.1), 0), [orders]);

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
      header: "Your Earning",
      cell: ({ row }: any) => (
        <span className="text-emerald-400 font-semibold">${(row.original.total * 0.9).toFixed(2)}</span>
      ),
    },
    {
      header: "Admin Fee (10%)",
      cell: ({ row }: any) => (
        <span className="text-white/40">${(row.original.total * 0.1).toFixed(2)}</span>
      ),
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
      header: "Detail",
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Payments</h1>
        <p className="text-white/35 text-sm mt-0.5">Revenue breakdown and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/8">
          <CardContent className="p-5">
            <DollarSign size={18} className="text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-0.5">Total Earnings (90%)</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/8">
          <CardContent className="p-5">
            <Percent size={18} className="text-amber-400 mb-2" />
            <p className="text-2xl font-bold text-white">${totalFees.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-0.5">Platform Fee (10%)</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/8">
          <CardContent className="p-5">
            <TrendingUp size={18} className="text-violet-400 mb-2" />
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-white/40 text-xs mt-0.5">Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/8 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search payments…"
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-violet-500 h-9"
            />
          </div>
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
                <tr><td colSpan={columns.length} className="text-center py-16 text-white/25 text-sm">No payments yet</td></tr>
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
