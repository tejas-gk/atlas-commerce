"use client";
import React from "react";
import Chart, { Props } from "react-apexcharts";

export const SalesChart = ({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const chartSeries: Props["series"] = [
    {
      name: "Revenue",
      data: ordersData?.map((data) => data.count) || [
        31, 40, 28, 51, 42, 109, 100,
      ],
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      animations: {
        // @ts-ignore
        easing: "easeinout",
        speed: 400,
      },
      fontFamily: "Inter, sans-serif",
      foreColor: "#6b7280",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#3b82f6", opacity: 0.35 },
          { offset: 100, color: "#3b82f6", opacity: 0.02 },
        ],
      },
    },
    colors: ["#3b82f6"],
    xaxis: {
      categories: ordersData?.map((data) =>
        new Date(data.month).toLocaleDateString("default", { month: "short" })
      ) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      labels: {
        show: true,
        style: { colors: "#9ca3af", fontFamily: "Inter, sans-serif", fontSize: "12px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        show: true,
        style: { colors: "#9ca3af", fontFamily: "Inter, sans-serif", fontSize: "12px" },
        formatter: (v: number) => `$${v}`,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      x: { show: true },
      y: {
        formatter: (value: number) => `$${value}`,
        title: { formatter: () => "" },
      },
      style: { fontFamily: "Inter, sans-serif", fontSize: "13px" },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    markers: {
      size: 0,
      hover: { size: 5 },
    },
    dataLabels: { enabled: false },
  };

  return (
    <div className="w-full -mx-1">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={300}
      />
    </div>
  );
};
