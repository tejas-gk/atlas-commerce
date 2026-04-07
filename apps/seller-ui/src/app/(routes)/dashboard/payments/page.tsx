"use client";

import React, { useState } from "react";
import {
  Search,
  Eye,
  DollarSign,
  Percent,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Download,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

// -- Types --

type PaymentStatus = "Completed" | "Pending" | "Failed" | "Refunded";

interface Payment {
  id: string;
  orderId: string;
  buyer: string;
  avatar: string;
  grossAmount: number;
  earning: number;
  fee: number;
  method: string;
  status: PaymentStatus;
  date: string;
}

// -- Mock data --

const mockPayments: Payment[] = [
  { id: "PAY-4521", orderId: "ORD-7891", buyer: "Sarah Chen", avatar: "SC", grossAmount: 284.00, earning: 255.60, fee: 28.40, method: "Visa •••• 4242", status: "Completed", date: "2026-04-06" },
  { id: "PAY-4520", orderId: "ORD-7890", buyer: "Marcus Johnson", avatar: "MJ", grossAmount: 59.99, earning: 53.99, fee: 6.00, method: "PayPal", status: "Pending", date: "2026-04-06" },
  { id: "PAY-4519", orderId: "ORD-7889", buyer: "Aisha Patel", avatar: "AP", grossAmount: 412.50, earning: 371.25, fee: 41.25, method: "Mastercard •••• 8531", status: "Completed", date: "2026-04-05" },
  { id: "PAY-4518", orderId: "ORD-7888", buyer: "Liam O'Brien", avatar: "LO", grossAmount: 129.00, earning: 116.10, fee: 12.90, method: "Stripe", status: "Refunded", date: "2026-04-05" },
  { id: "PAY-4517", orderId: "ORD-7887", buyer: "Yuki Tanaka", avatar: "YT", grossAmount: 89.99, earning: 80.99, fee: 9.00, method: "Apple Pay", status: "Completed", date: "2026-04-04" },
  { id: "PAY-4516", orderId: "ORD-7886", buyer: "Emma Wilson", avatar: "EW", grossAmount: 356.80, earning: 321.12, fee: 35.68, method: "Visa •••• 1234", status: "Pending", date: "2026-04-04" },
  { id: "PAY-4515", orderId: "ORD-7885", buyer: "David Kim", avatar: "DK", grossAmount: 175.00, earning: 157.50, fee: 17.50, method: "PayPal", status: "Completed", date: "2026-04-03" },
  { id: "PAY-4514", orderId: "ORD-7884", buyer: "Olivia Brown", avatar: "OB", grossAmount: 523.40, earning: 471.06, fee: 52.34, method: "Mastercard •••• 9012", status: "Completed", date: "2026-04-03" },
  { id: "PAY-4513", orderId: "ORD-7883", buyer: "James Lee", avatar: "JL", grossAmount: 44.99, earning: 40.49, fee: 4.50, method: "Stripe", status: "Failed", date: "2026-04-02" },
  { id: "PAY-4512", orderId: "ORD-7882", buyer: "Nina Garcia", avatar: "NG", grossAmount: 198.50, earning: 178.65, fee: 19.85, method: "Visa •••• 5678", status: "Completed", date: "2026-04-01" },
];

// -- Status config --

const statusConfig: Record<PaymentStatus, { dot: string; badge: string }> = {
  Completed: { dot: "bg-emerald-400", badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" },
  Pending:   { dot: "bg-amber-400",   badge: "border-amber-500/20 bg-amber-500/10 text-amber-400" },
  Failed:    { dot: "bg-red-400",     badge: "border-red-500/20 bg-red-500/10 text-red-400" },
  Refunded:  { dot: "bg-blue-400",    badge: "border-blue-500/20 bg-blue-500/10 text-blue-400" },
};

// -- Page --

export default function PaymentsPage() {
  const [search, setSearch] = useState("");

  const totalEarnings = mockPayments
    .filter((p) => p.status === "Completed")
    .reduce((s, p) => s + p.earning, 0);
  const totalFees = mockPayments
    .filter((p) => p.status === "Completed")
    .reduce((s, p) => s + p.fee, 0);
  const totalGross = mockPayments
    .filter((p) => p.status === "Completed")
    .reduce((s, p) => s + p.grossAmount, 0);
  const pendingAmount = mockPayments
    .filter((p) => p.status === "Pending")
    .reduce((s, p) => s + p.earning, 0);

  const filtered = search
    ? mockPayments.filter(
        (p) =>
          p.id.toLowerCase().includes(search.toLowerCase()) ||
          p.buyer.toLowerCase().includes(search.toLowerCase()) ||
          p.orderId.toLowerCase().includes(search.toLowerCase())
      )
    : mockPayments;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Revenue breakdown and payment history
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/[0.08] text-muted-foreground hover:text-foreground">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
      </div>

      {/* Revenue overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, change: "+18.2%", up: true, icon: DollarSign, bg: "bg-rose-500/15", iconColor: "text-rose-400" },
          { label: "Net Earnings (90%)", value: `$${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, change: "+15.4%", up: true, icon: Wallet, bg: "bg-emerald-500/15", iconColor: "text-emerald-400" },
          { label: "Platform Fee (10%)", value: `$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, change: "+18.2%", up: false, icon: Percent, bg: "bg-amber-500/15", iconColor: "text-amber-400" },
          { label: "Pending Payouts", value: `$${pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, change: "2 orders", up: true, icon: Clock, bg: "bg-blue-500/15", iconColor: "text-blue-400" },
        ].map((stat) => (
          <Card key={stat.label} className="border border-white/[0.08] bg-card/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold tracking-tight tabular-nums">{stat.value}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-[11px] text-muted-foreground/60 truncate">{stat.label}</p>
                  {stat.change.startsWith("+") || stat.change.startsWith("-") ? (
                    <span className={cn(
                      "inline-flex items-center text-[10px] font-medium",
                      stat.up ? "text-emerald-400" : "text-amber-400"
                    )}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40">{stat.change}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings breakdown mini card */}
      <Card className="border border-white/[0.08] bg-card/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Earnings Breakdown</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
              <Calendar className="h-3.5 w-3.5" />
              April 2026
            </div>
          </div>
          <div className="space-y-3">
            {/* Progress bar showing earnings vs fees */}
            <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden flex">
              <div className="h-full bg-emerald-500/80 rounded-l-full" style={{ width: "90%" }} />
              <div className="h-full bg-amber-500/60 rounded-r-full" style={{ width: "10%" }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                  <span className="text-[12px] text-muted-foreground/60">Your Earnings</span>
                  <span className="text-[12px] font-semibold tabular-nums text-emerald-400">
                    ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                  <span className="text-[12px] text-muted-foreground/60">Platform Fee</span>
                  <span className="text-[12px] font-semibold tabular-nums text-amber-400">
                    ${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="text-[12px] font-semibold tabular-nums">
                ${totalGross.toLocaleString("en-US", { minimumFractionDigits: 2 })} total
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction table */}
      <Card className="border border-white/[0.08] bg-card/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-semibold">Transaction History</h3>
          <div className="relative flex-1 max-w-xs ml-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="pl-9 h-9 border-white/[0.08] bg-white/[0.03] text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Transaction", "Customer", "Gross", "Earning", "Fee", "Method", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                        <DollarSign className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground/60">No transactions found</p>
                        <p className="text-[12px] text-muted-foreground/40 mt-0.5">
                          Try adjusting your search
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => {
                  const cfg = statusConfig[payment.status];
                  return (
                    <tr key={payment.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      {/* Transaction */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{payment.id}</p>
                          <p className="text-[11px] text-muted-foreground/50">{payment.orderId}</p>
                        </div>
                      </td>
                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-muted-foreground">
                            {payment.avatar}
                          </div>
                          <span className="text-[13px] font-medium text-foreground/90">{payment.buyer}</span>
                        </div>
                      </td>
                      {/* Gross */}
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] tabular-nums text-muted-foreground">${payment.grossAmount.toFixed(2)}</span>
                      </td>
                      {/* Earning */}
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-semibold tabular-nums text-emerald-400">${payment.earning.toFixed(2)}</span>
                      </td>
                      {/* Fee */}
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] tabular-nums text-muted-foreground/50">-${payment.fee.toFixed(2)}</span>
                      </td>
                      {/* Method */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground/40" />
                          <span className="text-[12px] text-muted-foreground">{payment.method}</span>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-md",
                            cfg.badge
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          {payment.status}
                        </Badge>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] text-muted-foreground/70 tabular-nums">
                          {new Date(payment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-5 py-3.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                        >
                          <Link href={`/order/${payment.orderId}`}>
                            <Eye size={15} />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
          <p className="text-[11px] text-muted-foreground/40">
            Showing {filtered.length} of {mockPayments.length} transactions
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] text-muted-foreground/60" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] bg-white/[0.04] text-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3 border-white/[0.08] text-muted-foreground/60">
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}