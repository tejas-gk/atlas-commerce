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

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders ?? [];
};

const statusClass = (status: string) => {
  if (status === "Paid")   return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (status === "Failed") return "bg-red-500/10 text-red-400 border border-red-500/20";
  return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
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
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${statusClass(row.original.status)}`}>
          {row.original.status}
        </span>
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
        <Link href={`/order/${row.original.id}`} className="text-violet-400 hover:text-violet-300 transition-colors">
          <Eye size={16} />
        </Link>
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
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Payments</h1>
        <p className="text-white/35 text-sm mt-0.5">Revenue breakdown and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-emerald-600/15 to-emerald-600/5 backdrop-blur-md p-5" style={{boxShadow: "0 0 30px rgba(16,185,129,0.1)"}}>
          <DollarSign size={18} className="text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
          <p className="text-white/40 text-xs mt-0.5">Total Earnings (90%)</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-amber-600/15 to-amber-600/5 backdrop-blur-md p-5" style={{boxShadow: "0 0 30px rgba(245,158,11,0.1)"}}>
          <Percent size={18} className="text-amber-400 mb-2" />
          <p className="text-2xl font-bold text-white">${totalFees.toFixed(2)}</p>
          <p className="text-white/40 text-xs mt-0.5">Platform Fee (10%)</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-violet-600/15 to-violet-600/5 backdrop-blur-md p-5" style={{boxShadow: "0 0 30px rgba(124,58,237,0.1)"}}>
          <TrendingUp size={18} className="text-violet-400 mb-2" />
          <p className="text-2xl font-bold text-white">{orders.length}</p>
          <p className="text-white/40 text-xs mt-0.5">Total Transactions</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search payments…"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 placeholder:text-white/25 text-sm outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
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
      </div>
    </div>
  );
}
