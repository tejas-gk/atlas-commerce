"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { month: "Jan", lastMonth: 3200, thisMonth: 3800 },
  { month: "Feb", lastMonth: 2800, thisMonth: 3400 },
  { month: "Mar", lastMonth: 3600, thisMonth: 4100 },
  { month: "Apr", lastMonth: 2900, thisMonth: 3900 },
  { month: "May", lastMonth: 3100, thisMonth: 4200 },
  { month: "Jun", lastMonth: 3004, thisMonth: 4504 },
]

const config = {
  lastMonth: { label: "Last Month", color: "hsl(var(--chart-4))" },
  thisMonth: { label: "This Month", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export function CustomerSatisfactionChart() {
  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="h-[180px] w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="csLastGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="csThisGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            width={36}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            content={<ChartTooltipContent className="text-xs" />}
          />
          <Area
            dataKey="lastMonth"
            type="monotone"
            stroke="hsl(var(--chart-4))"
            strokeWidth={2}
            fill="url(#csLastGrad)"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
          <Area
            dataKey="thisMonth"
            type="monotone"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            fill="url(#csThisGrad)"
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
        </AreaChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
          <span className="text-[11px] text-muted-foreground/70">Last Month</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
          <span className="text-[11px] text-muted-foreground/70">This Month</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-8 pt-1">
        <div className="text-center">
          <p className="text-lg font-semibold tabular-nums">$3,004</p>
          <p className="text-[10px] text-muted-foreground/50">Last Month</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold tabular-nums">$4,504</p>
          <p className="text-[10px] text-muted-foreground/50">This Month</p>
        </div>
      </div>
    </div>
  )
}
