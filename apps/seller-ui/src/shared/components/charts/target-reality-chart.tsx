"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { month: "Jan", reality: 6200, target: 8500 },
  { month: "Feb", reality: 5800, target: 9000 },
  { month: "Mar", reality: 7400, target: 8800 },
  { month: "Apr", reality: 8823, target: 10200 },
  { month: "May", reality: 9100, target: 11500 },
  { month: "Jun", reality: 7800, target: 12122 },
  { month: "Jul", reality: 8200, target: 11000 },
]

const config = {
  reality: { label: "Reality Sales", color: "hsl(var(--chart-2))" },
  target: { label: "Target Sales", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

export function TargetRealityChart() {
  const realityTotal = data.reduce((s, d) => s + d.reality, 0)
  const targetTotal = data.reduce((s, d) => s + d.target, 0)

  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="h-[180px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
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
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            width={32}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--border))", opacity: 0.15 }}
            content={<ChartTooltipContent className="text-xs" />}
          />
          <Bar dataKey="reality" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} barSize={12} opacity={0.85} />
          <Bar dataKey="target" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} barSize={12} opacity={0.85} />
        </BarChart>
      </ChartContainer>
      <div className="space-y-2.5 px-1">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground/60">Reality Sales</p>
            <p className="text-xs text-muted-foreground/40">Global</p>
          </div>
          <p className="text-sm font-semibold tabular-nums text-emerald-400">
            {(realityTotal / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-muted-foreground/60">Target Sales</p>
            <p className="text-xs text-muted-foreground/40">Commercial</p>
          </div>
          <p className="text-sm font-semibold tabular-nums">
            {(targetTotal / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        </div>
      </div>
    </div>
  )
}
