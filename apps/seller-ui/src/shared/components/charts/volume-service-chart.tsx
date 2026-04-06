"use client"

import { Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { label: "Q1", volume: 420, service: 180 },
  { label: "Q2", volume: 380, service: 220 },
  { label: "Q3", volume: 510, service: 160 },
  { label: "Q4", volume: 340, service: 275 },
]

const config = {
  volume: { label: "Volume", color: "hsl(var(--chart-4))" },
  service: { label: "Services", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export function VolumeServiceChart() {
  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="h-[200px] w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barGap={4}>
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            width={28}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--border))", opacity: 0.15 }}
            content={<ChartTooltipContent className="text-xs" />}
          />
          <Bar dataKey="volume" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} barSize={14} opacity={0.85} />
          <Bar dataKey="service" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} barSize={14} opacity={0.85} />
        </BarChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-4))" }} />
            <span className="text-[11px] text-muted-foreground/60">Volume</span>
          </div>
          <p className="text-sm font-semibold tabular-nums">1,135</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
            <span className="text-[11px] text-muted-foreground/60">Services</span>
          </div>
          <p className="text-sm font-semibold tabular-nums">635</p>
        </div>
      </div>
    </div>
  )
}
