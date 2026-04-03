"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { SalesChart } from "@/shared/components/charts/sales.chart";
import GeographicalMap from "@/shared/components/charts/geographicalMap";

const kpiCards = [
  { label: "Total Revenue",    value: "$48,295", change: "+12.5%", up: true,  icon: DollarSign,  color: "from-violet-600/20 to-violet-600/5",  iconColor: "text-violet-400", glow: "rgba(124,58,237,0.15)" },
  { label: "Total Orders",     value: "1,284",   change: "+8.2%",  up: true,  icon: ShoppingCart, color: "from-pink-600/20 to-pink-600/5",      iconColor: "text-pink-400",   glow: "rgba(236,72,153,0.15)" },
  { label: "Total Products",   value: "342",     change: "+3.1%",  up: true,  icon: Package,      color: "from-cyan-600/20 to-cyan-600/5",      iconColor: "text-cyan-400",   glow: "rgba(6,182,212,0.15)"  },
  { label: "Active Customers", value: "9,041",   change: "-1.4%",  up: false, icon: Users,        color: "from-amber-600/20 to-amber-600/5",    iconColor: "text-amber-400",  glow: "rgba(245,158,11,0.15)" },
];

const deviceData = [
  { name: "Mobile",  value: 55 },
  { name: "Tablet",  value: 20 },
  { name: "Desktop", value: 25 },
];
const PIE_COLORS = ["#7c3aed", "#ec4899", "#06b6d4"];

type Order = { id: string; customer: string; amount: string; status: "Paid" | "Pending" | "Failed" };

const orders: Order[] = [
  { id: "ORD-001", customer: "John Doe",      amount: "$250", status: "Paid"    },
  { id: "ORD-002", customer: "Jane Smith",    amount: "$180", status: "Pending" },
  { id: "ORD-003", customer: "Alice Johnson", amount: "$420", status: "Paid"    },
  { id: "ORD-004", customer: "Bob Williams",  amount: "$95",  status: "Failed"  },
  { id: "ORD-005", customer: "Emma Brown",    amount: "$310", status: "Paid"    },
];

const statusBadge = (status: Order["status"]) => {
  const map = {
    Paid:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    Pending: "bg-amber-500/10  text-amber-400  border border-amber-500/20",
    Failed:  "bg-red-500/10   text-red-400   border border-red-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${map[status]}`}>
      {status}
    </span>
  );
};

const columns = [
  { accessorKey: "id",       header: "Order ID", cell: ({ row }: any) => <span className="text-white/60 text-xs font-mono">{row.original.id}</span> },
  { accessorKey: "customer", header: "Customer",  cell: ({ row }: any) => <span className="text-white text-sm">{row.original.customer}</span> },
  { accessorKey: "amount",   header: "Amount",    cell: ({ row }: any) => <span className="text-violet-300 font-semibold">{row.original.amount}</span> },
  { accessorKey: "status",   header: "Status",    cell: ({ row }: any) => statusBadge(row.original.status) },
];

export default function DashboardPage() {
  const table = useReactTable({ data: orders, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-white/40 text-sm mt-0.5">Welcome back — here is what is happening today.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br ${card.color} backdrop-blur-md p-5`}
              style={{ boxShadow: `0 0 30px ${card.glow}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <Icon size={18} className={card.iconColor} />
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${card.up ? "text-emerald-400" : "text-red-400"}`}>
                  {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {card.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Revenue Overview</h3>
              <p className="text-white/30 text-xs">Last 6 months</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">Monthly</span>
          </div>
          <SalesChart />
        </div>

        {/* Device pie */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Device Breakdown</h3>
            <p className="text-white/30 text-xs">Traffic by device type</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                {deviceData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 12 }}
              />
              <Legend
                formatter={(val) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Map + Orders row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Geo map */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md p-5">
          <div className="mb-4">
            <h3 className="text-white font-semibold text-sm">Geographic Sales</h3>
            <p className="text-white/30 text-xs">Sales distribution by region</p>
          </div>
          <GeographicalMap />
        </div>

        {/* Recent orders */}
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold text-sm">Recent Orders</h3>
              <p className="text-white/30 text-xs">Latest 5 transactions</p>
            </div>
            <a href="/dashboard/orders" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-0.5 transition-colors">
              View all <ArrowUpRight size={12} />
            </a>
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-white/5 hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="text-white/30 text-[11px] font-semibold uppercase tracking-wider">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/3 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
