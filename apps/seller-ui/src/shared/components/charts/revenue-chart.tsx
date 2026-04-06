"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { day: "Monday",    online: 15200, offline: 8400 },
  { day: "Tuesday",   online: 18600, offline: 10200 },
  { day: "Wednesday", online: 12800, offline: 9600 },
  { day: "Thursday",  online: 20100, offline: 11400 },
  { day: "Friday",    online: 16400, offline: 7800 },
  { day: "Saturday",  online: 22500, offline: 14200 },
  { day: "Sunday",    online: 19800, offline: 12600 },
]

const config = {
  online: { label: "Online Sales", color: "hsl(var(--chart-4))" },
  offline: { label: "Offline Sales", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export function RevenueChart() {
  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="h-[220px] w-full">
        <BarChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }} barGap={3}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickFormatter={(v) => v.slice(0, 3)}
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
          <Bar dataKey="online" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
          <Bar dataKey="offline" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
        </BarChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
          <span className="text-[11px] text-muted-foreground/70">Online Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
          <span className="text-[11px] text-muted-foreground/70">Offline Sales</span>
        </div>
      </div>
    </div>
  )
}
