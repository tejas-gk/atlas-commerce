"use client";
import React, { useMemo } from "react";
import Chart, { Props } from "react-apexcharts";

export type SalesChartPoint = {
  label: string;
  revenue: number;
  previousRevenue: number;
  orders: number;
};

const DEFAULT_DATA: SalesChartPoint[] = [
  { label: "Jan", revenue: 182400, previousRevenue: 171000, orders: 2590 },
  { label: "Feb", revenue: 194700, previousRevenue: 179900, orders: 2724 },
  { label: "Mar", revenue: 206100, previousRevenue: 191500, orders: 2898 },
  { label: "Apr", revenue: 224900, previousRevenue: 207300, orders: 3154 },
  { label: "May", revenue: 239300, previousRevenue: 219600, orders: 3322 },
  { label: "Jun", revenue: 278400, previousRevenue: 244500, orders: 3895 },
  { label: "Jul", revenue: 293700, previousRevenue: 256200, orders: 4081 },
];

const shortCurrency = (value: number) =>
  `$${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;

const fullCurrency = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;

export const SalesChart = ({
  data = DEFAULT_DATA,
  height = 365,
}: {
  data?: SalesChartPoint[];
  height?: number;
}) => {
  const chartData = data.length > 0 ? data : DEFAULT_DATA;

  const categories = chartData.map((point) => point.label);
  const revenueSeries = chartData.map((point) => point.revenue);
  const previousRevenueSeries = chartData.map((point) => point.previousRevenue);

  const avgRevenue =
    revenueSeries.reduce((acc, value) => acc + value, 0) / Math.max(revenueSeries.length, 1);

  const highestRevenue = Math.max(...revenueSeries);
  const peakPoint = chartData.reduce((best, point) =>
    point.revenue > best.revenue ? point : best
  );

  const chartSeries: Props["series"] = [
    {
      name: "Revenue",
      type: "area",
      data: revenueSeries,
    },
    {
      name: "Previous Period",
      type: "line",
      data: previousRevenueSeries,
    },
  ];

  const chartOptions: Props["options"] = useMemo(
    () => ({
      chart: {
        type: "line",
        background: "transparent",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "Plus Jakarta Sans, Geist, sans-serif",
        foreColor: "#6b7c52",
        stacked: false,
        animations: {
          easing: "easeinout",
          speed: 520,
        },
        dropShadow: {
          enabled: true,
          top: 8,
          left: 0,
          blur: 10,
          color: "#7faa2b",
          opacity: 0.12,
        },
      },
      colors: ["#7cad20", "#b9ac5f"],
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        fontSize: "11px",
        fontWeight: 600,
        labels: { colors: "#6f7f57" },
        markers: { size: 8, strokeWidth: 0 },
        itemMargin: { horizontal: 14, vertical: 0 },
      },
      stroke: {
        curve: "smooth",
        width: [3.2, 2.1],
        dashArray: [0, 8],
      },
      dataLabels: { enabled: false },
      markers: {
        size: [0, 0],
        hover: { size: 6, sizeOffset: 2 },
      },
      fill: {
        type: ["gradient", "solid"],
        gradient: {
          shade: "light",
          shadeIntensity: 0.85,
          opacityFrom: 0.3,
          opacityTo: 0.02,
          stops: [0, 88, 100],
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: {
            colors: "#7e8d64",
            fontSize: "11px",
            fontWeight: 600,
          },
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        min: 0,
        max: Math.ceil((highestRevenue * 1.22) / 1000) * 1000,
        tickAmount: 5,
        labels: {
          style: {
            colors: "#7e8d64",
            fontSize: "11px",
          },
          formatter: (value: number) => shortCurrency(value),
        },
        title: {
          text: "Revenue",
          style: { color: "#7e8d64", fontSize: "11px", fontWeight: 600 },
        },
      },
      grid: {
        borderColor: "#ebefd9",
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 6, right: 8, top: 4, bottom: 0 },
      },
      annotations: {
        yaxis: [
          {
            y: avgRevenue,
            borderColor: "#a6c066",
            strokeDashArray: 6,
            label: {
              text: `Avg ${shortCurrency(avgRevenue)}`,
              style: {
                color: "#35511f",
                background: "#e2f0c2",
                fontSize: "10px",
                fontWeight: 700,
              },
            },
          },
        ],
        points: [
          {
            x: peakPoint.label,
            y: peakPoint.revenue,
            seriesIndex: 0,
            marker: {
              size: 5,
              fillColor: "#ffffff",
              strokeColor: "#7cad20",
              strokeWidth: 3,
            },
            label: {
              text: `Peak ${peakPoint.label}`,
              offsetY: -8,
              borderColor: "#d1dfaa",
              style: {
                color: "#35511f",
                background: "#f3f9df",
                fontSize: "10px",
                fontWeight: 700,
              },
            },
          },
        ],
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        theme: "light",
        style: {
          fontSize: "12px",
          fontFamily: "Plus Jakarta Sans, Geist, sans-serif",
        },
        y: [
          {
            formatter: (value: number) => `${fullCurrency(value)} revenue`,
          },
          {
            formatter: (value: number) => `${fullCurrency(value)} previous`,
          },
        ],
      },
    }),
    [avgRevenue, categories, highestRevenue, peakPoint.label, peakPoint.revenue]
  );

  return (
    <div className="rounded-[16px] border border-[#edf2dc] bg-[radial-gradient(circle_at_100%_0%,rgba(226,241,183,0.34),rgba(255,255,255,0.72))] p-2">
      <Chart options={chartOptions} series={chartSeries} type="line" height={height} />
    </div>
  );
};
