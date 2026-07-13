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
        easing: "linear",
        speed: 300,
      },
      fontFamily: "Poppins, sans-serif",
      foreColor: "#687259",
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
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
          colors: "#8c9380",
          fontFamily: "Poppins, sans-serif",
        },
      },
      axisBorder: {
        show: true,
        color: "#e7ead6",
      },
      axisTicks: {
        show: false,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: {
      show: true,
      borderColor: "#eef0df",
      strokeDashArray: 4,
    },
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: (value: number) => `${value}`,
        title: {
          formatter: () => "",
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#84cc16"],
    },
    markers: {
      size: 0,
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#84cc16"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 0, opacityFrom: 0.3, opacityTo: 0.02, stops: [0, 95, 100] },
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
            height={330}
          />
        </div>
      </Box>
    </div>
  );
};
