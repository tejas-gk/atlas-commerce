"use client";
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import useSeller from "@/hooks/useSeller";
import { Input } from "@workspace/ui/components/input";
import { Card } from "@workspace/ui/components/card";

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-seller-orders");
  return res.data.orders;
};

const KPI_CARDS = [
  {
    label: "Total Orders",
    value: "124",
    sub: "+10 this month",
    trend: "up",
    Icon: Package,
    iconCls: "bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Revenue",
    value: "$12,480",
    sub: "+5.2%",
    trend: "up",
    Icon: TrendingUp,
    iconCls: "bg-emerald-500/15 text-emerald-400",
  },
  {
    label: "Pending",
    value: "8",
    sub: "Awaiting action",
    trend: "down",
    Icon: AlertTriangle,
    iconCls: "bg-amber-500/15 text-amber-400",
  },
];

const OrdersTable = () => {
  const { seller } = useSeller();
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders", seller?.activeShopId],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    enabled: !!seller?.activeShopId,
  });

  const columns = useMemo(
    () => [
      {
        id: "order",
        header: "Order",
        cell: ({ row }: any) => (
          <span className="text-sm font-medium text-foreground/90">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        id: "buyer",
        header: "Buyer",
        cell: ({ row }: any) => (
          <span className="text-muted-foreground">
            {row.original.user?.name ?? "Guest"}
          </span>
        ),
      },
      {
        id: "total",
        header: "Total",
        cell: ({ row }: any) => (
          <span className="font-semibold text-foreground">
            ${row.original.total}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`text-xs px-2 py-1 rounded-full ${row.original.status === "Paid"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
              }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        id: "date",
        header: "Date",
        cell: ({ row }: any) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return (
            <span className="text-muted-foreground text-sm">
              {date}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }: any) => (
          <Link
            href={`/order/${row.original.id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Eye size={16} />
          </Link>
        ),
      },
    ],
    []
  );

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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          All Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and manage your orders
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPI_CARDS.map(({ label, value, sub, trend, Icon, iconCls }) => (
          <Card key={label} className="p-5 border bg-card/50">
            <div className="flex justify-between mb-3">
              <div
                className={`h-9 w-9 flex items-center justify-center rounded-full ${iconCls}`}
              >
                <Icon size={16} />
              </div>
              {trend === "up" ? (
                <ArrowUpRight className="text-emerald-400" size={14} />
              ) : (
                <ArrowDownRight className="text-red-400" size={14} />
              )}
            </div>
            <p className="text-xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              {label}
            </p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border bg-card/50 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b">
          <div className="relative max-w-xs w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search orders..."
              className="pl-8 h-8 text-sm"
            />
          </div>

          <p className="ml-auto text-xs text-muted-foreground">
            {orders.length} items
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-5 py-3 text-left text-xs text-muted-foreground"
                    >
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <p className="text-muted-foreground text-sm">
                      No orders found
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-white/[0.02]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3">
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
        )}
      </Card>
    </div>
  );
};

export default OrdersTable;
