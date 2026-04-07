"use client";

import React from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { RevenueChart } from "../../../shared/components/charts/revenue-chart";
import { VisitorInsightsChart } from "../../../shared/components/charts/visitor-insights-chart";
import { CustomerSatisfactionChart } from "../../../shared/components/charts/customer-satisfaction-chart";
import { TargetRealityChart } from "../../../shared/components/charts/target-reality-chart";
import { VolumeServiceChart } from "../../../shared/components/charts/volume-service-chart";

// ── Mock data ───────────────────────────────────────────────────

const kpiData = [
  {
    label: "Total Sales",
    value: "$1k",
    change: "+8% from yesterday",
    icon: DollarSign,
    bg: "bg-rose-500/15",
    iconColor: "text-rose-400",
  },
  {
    label: "Total Order",
    value: "300",
    change: "+5% from yesterday",
    icon: ShoppingCart,
    bg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    label: "Product Sold",
    value: "5",
    change: "+1.2% from yesterday",
    icon: Package,
    bg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
  },
  {
    label: "New Customers",
    value: "8",
    change: "0.5% from yesterday",
    icon: Users,
    bg: "bg-blue-500/15",
    iconColor: "text-blue-400",
  },
];

const topProducts = [
  { name: "Home Decor Range", popularity: 45, color: "bg-blue-500" },
  { name: "Disney Princess Pink Bag 18'", popularity: 29, color: "bg-emerald-500" },
  { name: "Bathroom Essentials", popularity: 18, color: "bg-rose-500" },
  { name: "Apple Smartwatches", popularity: 25, color: "bg-amber-500" },
];

// ── Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">

      {/* ── Row 1: KPI cards + Visitor Insights ─────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left — Today's Sales + 4 KPI cards */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border border-white/[0.08] bg-card/50">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Today&apos;s Sales
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sales Summary
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-white/[0.1] text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiData.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-3 hover:bg-white/[0.05] transition-colors duration-200"
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", kpi.bg)}>
                      <kpi.icon className={cn("h-5 w-5", kpi.iconColor)} />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{kpi.label}</p>
                    </div>
                    <p className="text-[10px] text-emerald-400/80">
                      <TrendingUp className="h-3 w-3 inline mr-1 -mt-0.5" />
                      {kpi.change}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Visitor Insights */}
        <Card className="lg:col-span-2 border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Visitor Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <VisitorInsightsChart />
          </CardContent>
        </Card>
      </div>

      {/* ── Row 2: Revenue + Customer Satisfaction + Target vs Reality */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RevenueChart />
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CustomerSatisfactionChart />
          </CardContent>
        </Card>

        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Target vs Reality
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <TargetRealityChart />
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Top Products + Sales Map + Volume ────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Table header */}
            <div className="grid grid-cols-[28px_1fr_120px_52px] gap-2 pb-2 border-b border-white/[0.06]">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">#</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Name</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium">Popularity</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium text-right">Sales</span>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {topProducts.map((product, i) => (
                <div key={product.name} className="grid grid-cols-[28px_1fr_120px_52px] gap-2 py-3 items-center">
                  <span className="text-xs text-muted-foreground/60 font-medium tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] font-medium text-foreground/90 truncate">
                    {product.name}
                  </span>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", product.color)}
                      style={{ width: `${product.popularity}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                      {product.popularity}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales Mapping by Country */}
        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Sales Mapping by Country
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center h-[260px]">
              {/* Simple visualisation — dots for top regions */}
              <div className="space-y-4 w-full">
                {[
                  { country: "United States", value: 38, color: "bg-rose-500" },
                  { country: "India", value: 24, color: "bg-blue-500" },
                  { country: "United Kingdom", value: 18, color: "bg-emerald-500" },
                  { country: "Germany", value: 12, color: "bg-amber-500" },
                  { country: "Canada", value: 8, color: "bg-rose-500" },
                ].map((region) => (
                  <div key={region.country} className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", region.color)} />
                    <span className="text-[13px] text-foreground/80 flex-1">{region.country}</span>
                    <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full opacity-80", region.color)}
                        style={{ width: `${region.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground w-8 text-right">
                      {region.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Volume vs Service Level */}
        <Card className="border border-white/[0.08] bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Volume vs Service Level
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <VolumeServiceChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
