"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { month: "Jan", loyal: 200, new: 100, unique: 150 },
  { month: "Feb", loyal: 180, new: 120, unique: 170 },
  { month: "Mar", loyal: 260, new: 90, unique: 200 },
  { month: "Apr", loyal: 280, new: 200, unique: 180 },
  { month: "May", loyal: 300, new: 160, unique: 250 },
  { month: "Jun", loyal: 340, new: 180, unique: 280 },
  { month: "Jul", loyal: 400, new: 260, unique: 200 },
  { month: "Aug", loyal: 350, new: 200, unique: 310 },
  { month: "Sept", loyal: 300, new: 180, unique: 250 },
  { month: "Oct", loyal: 280, new: 150, unique: 220 },
  { month: "Nov", loyal: 320, new: 200, unique: 280 },
  { month: "Dec", loyal: 380, new: 250, unique: 300 },
]

const config = {
  loyal: { label: "Loyal Customers", color: "hsl(var(--chart-1))" },
  new: { label: "New Customers", color: "hsl(var(--chart-5))" },
  unique: { label: "Unique Customers", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export function VisitorInsightsChart() {
  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="h-[220px] w-full">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            width={32}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            content={<ChartTooltipContent className="text-xs" />}
          />
          <Line
            dataKey="loyal"
            type="monotone"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
          <Line
            dataKey="new"
            type="monotone"
            stroke="hsl(var(--chart-5))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
          <Line
            dataKey="unique"
            type="monotone"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--background))" }}
          />
        </LineChart>
      </ChartContainer>
      <div className="flex items-center justify-center gap-6">
        {[
          { key: "loyal", label: "Loyal Customers", color: "hsl(var(--chart-1))" },
          { key: "new", label: "New Customers", color: "hsl(var(--chart-5))" },
          { key: "unique", label: "Unique Customers", color: "hsl(var(--chart-2))" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-muted-foreground/70">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
