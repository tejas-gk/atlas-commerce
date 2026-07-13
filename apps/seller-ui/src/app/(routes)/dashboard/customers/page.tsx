"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, UsersRound } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import useSeller from "@/hooks/useSeller";

type Customer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string;
  status: "Active" | "New" | "Returning";
};

const getOrders = async () =>
  (await axiosInstance.get("/order/api/get-seller-orders")).data.orders ?? [];
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CustomersPage() {
  const { seller } = useSeller();
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("All");
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-customer-orders", seller?.activeShopId],
    queryFn: getOrders,
    enabled: !!seller?.activeShopId,
    staleTime: 300000,
  });

  const customers = useMemo<Customer[]>(() => {
    const grouped = new Map<string, Customer>();
    for (const order of orders) {
      const user = order.user ?? order.customer ?? {};
      const email = user.email || order.email || "guest@customer.local";
      const existing = grouped.get(email);
      const total = Number(order.total ?? order.amount ?? 0);
      const date = order.createdAt ?? new Date().toISOString();
      if (existing) {
        existing.orders += 1;
        existing.spent += total;
        if (new Date(date) > new Date(existing.lastOrder))
          existing.lastOrder = date;
        existing.status = "Returning";
      } else
        grouped.set(email, {
          id: user.id ?? email,
          name: user.name || order.customerName || "Guest customer",
          email,
          orders: 1,
          spent: total,
          lastOrder: date,
          status: "New",
        });
    }
    return [...grouped.values()].sort(
      (a, b) =>
        new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime(),
    );
  }, [orders]);

  const visible = customers.filter(
    (c) =>
      (segment === "All" || c.status === segment) &&
      `${c.name} ${c.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const exportCsv = () => {
    const rows = [
      ["Name", "Email", "Orders", "Total spent", "Last order"],
      ...visible.map((c) => [
        c.name,
        c.email,
        String(c.orders),
        String(c.spent),
        c.lastOrder,
      ]),
    ];
    const blob = new Blob(
      [
        rows
          .map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
          .join("\n"),
      ],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shopify-page">
      <div className="shopify-page-header">
        <div>
          <p className="shopify-eyebrow">Customers</p>
          <h1>Customers</h1>
          <p>Understand who buys from your store and how often they return.</p>
        </div>
        <button className="shopify-secondary-button" onClick={exportCsv}>
          <Download size={15} /> Export
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Total customers" value={String(customers.length)} />
        <Metric
          label="Returning customers"
          value={String(customers.filter((c) => c.orders > 1).length)}
        />
        <Metric
          label="Average order value"
          value={money.format(
            orders.length
              ? customers.reduce((n, c) => n + c.spent, 0) / orders.length
              : 0,
          )}
        />
      </div>
      <section className="shopify-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#e4e7d5] p-3 sm:flex-row sm:items-center">
          <div className="flex rounded-xl bg-[#f1f2e9] p-1">
            {["All", "New", "Returning"].map((s) => (
              <button
                key={s}
                onClick={() => setSegment(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${segment === s ? "bg-white text-[#202223] shadow-sm" : "text-[#6d7175]"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <label className="relative sm:ml-auto sm:w-72">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c9196]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="shopify-input pl-9"
              placeholder="Search customers"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="shopify-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Orders</th>
                <th>Amount spent</th>
                <th>Last order</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    Loading customers…
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f4d0] text-xs font-bold text-[#3f6212]">
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-semibold text-[#202223]">
                            {c.name}
                          </p>
                          <p className="text-xs text-[#8c9196]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{c.orders}</td>
                    <td className="font-semibold">{money.format(c.spent)}</td>
                    <td>
                      {new Date(c.lastOrder).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span className="shopify-badge">{c.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <div className="grid place-items-center py-14 text-center">
                      <UsersRound className="mb-3 text-[#8c9196]" />
                      <p className="font-semibold">No customers found</p>
                      <p className="text-xs text-[#8c9196]">
                        Customers appear here after their first order.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="shopify-card p-4">
      <p className="text-xs text-[#6d7175]">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-[#202223]">
        {value}
      </p>
    </div>
  );
}
