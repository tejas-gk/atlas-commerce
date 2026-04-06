"use client"

import { Pie, PieChart, Cell, Label } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"
import type { ChartConfig } from "@workspace/ui/components/chart"

const data = [
  { device: "Desktop", visitors: 24828 },
  { device: "Mobile",  visitors: 25010 },
  { device: "Tablet",  visitors: 3200  },
]

const total = data.reduce((sum, d) => sum + d.visitors, 0)

const config = {
  visitors: { label: "Visitors" },
  Desktop:  { label: "Desktop", color: "hsl(var(--chart-1))" },
  Mobile:   { label: "Mobile",  color: "hsl(var(--chart-4))" },
  Tablet:   { label: "Tablet",  color: "hsl(var(--chart-3))" },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-3))",
]

export function DeviceChart() {
  return (
    <div className="flex flex-col gap-5">
      <ChartContainer config={config} className="mx-auto h-[200px] w-full max-w-[240px]">
        <PieChart>
          <Pie
            data={data}
            dataKey="visitors"
            nameKey="device"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={86}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={entry.device} fill={COLORS[index]} opacity={0.85} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-xl font-semibold">
                        {(total / 1000).toFixed(0)}k
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 12} className="fill-muted-foreground text-[10px]">
                        visitors
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel className="text-xs" />} />
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="space-y-3 px-1">
        {data.map((entry, i) => {
          const pct = ((entry.visitors / total) * 100).toFixed(1)
          return (
            <div key={entry.device} className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i], opacity: 0.85 }} />
              <span className="text-xs text-muted-foreground/70 flex-1">{entry.device}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: COLORS[i], opacity: 0.7 }}
                  />
                </div>
                <span className="text-xs font-medium w-10 text-right tabular-nums">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
