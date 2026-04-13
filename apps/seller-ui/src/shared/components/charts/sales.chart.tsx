"use client";
import React from "react";
import Chart, { Props } from "react-apexcharts";
import Box from "../box";

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
      name: "Sales",
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
        speed: 500,
      },
      fontFamily: "Inter, sans-serif",
      foreColor: "#6b7c52",
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
    },
    colors: ["#86b81d"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        type: "vertical",
        colorStops: [
          { offset: 0, color: "#86b81d", opacity: 0.25 },
          { offset: 100, color: "#86b81d", opacity: 0.01 },
        ],
      },
    },
    xaxis: {
      categories: ordersData?.map((data) =>
        new Date(data.month).toLocaleDateString("default", {
          month: "short",
        })
      ) || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      labels: {
        show: true,
        style: {
          colors: "#8a9a6a",
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: "#8a9a6a",
          fontSize: "11px",
          fontFamily: "Inter, sans-serif",
        },
        formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      show: true,
      borderColor: "#f0f2e0",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { left: 0, right: 0, top: -10, bottom: 0 },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      style: { fontSize: "12px", fontFamily: "Inter, sans-serif" },
      x: { show: true },
      y: {
        formatter: (value: number) => `${value.toLocaleString()} orders`,
        title: { formatter: () => "" },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    markers: {
      size: 0,
      hover: { size: 5, sizeOffset: 2 },
    },
    dataLabels: {
      enabled: false,
    },
  };

  return (
    <div className="">
      <Box
        css={{
          width: "100%",
          zIndex: 5,
        }}
        className="text-black rounded-xl"
      >
        <div id="chart">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={425}
          />
        </div>
      </Box>
    </div>
  );
};
