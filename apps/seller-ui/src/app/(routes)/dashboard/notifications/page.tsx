"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import React, { useState } from "react";
import {
  ShoppingBag,
  AlertTriangle,
  Megaphone,
  Bell,
  CheckCheck,
  DollarSign,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";

// ── Hardcoded sample shown when API returns empty ──────────────────────────
const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-4821 has been placed by Sarah Ahmed.",
    redirect_link: "/dashboard/orders",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    type: "stock",
    title: "Low Stock Alert",
    message: '"Premium Wireless Headphones" has only 3 units left.',
    redirect_link: "/dashboard/all-products",
    status: "Unread",
    createdAt: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
  {
    id: "3",
    type: "order",
    title: "Order Delivered",
    message: "Order #ORD-4801 has been marked as delivered.",
    redirect_link: "/dashboard/orders",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "4",
    type: "promo",
    title: "Discount Code Used",
    message: 'Code "SAVE20" was applied to 5 orders today.',
    redirect_link: "/dashboard/discount-codes",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "5",
    type: "payment",
    title: "Payout Processed",
    message: "Your payout of $1,240.00 has been successfully processed.",
    redirect_link: "/dashboard/payments",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "6",
    type: "order",
    title: "New Order Received",
    message: "Order #ORD-4819 has been placed by James Kowalski.",
    redirect_link: "/dashboard/orders",
    status: "Read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
  },
];

const TYPE_META: Record<string, { Icon: any; bg: string; color: string }> = {
  order: { Icon: ShoppingBag, bg: "bg-[#e6f9f0]", color: "text-emerald-600" },
  stock: { Icon: AlertTriangle, bg: "bg-amber-50", color: "text-amber-500" },
  promo: { Icon: Megaphone, bg: "bg-violet-50", color: "text-violet-500" },
  payment: { Icon: DollarSign, bg: "bg-blue-50", color: "text-blue-500" },
  system: { Icon: Bell, bg: "bg-[#f0f4d8]", color: "text-[#556244]" },
};

const FILTER_TABS = ["All", "Unread", "Orders", "System"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Page = () => {
  const [activeTab, setActiveTab] = useState("All");
  const queryClient = useQueryClient();

  const { data: apiData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications;
    },
  });

  const notifications: any[] = (apiData?.length ? apiData : SAMPLE_NOTIFICATIONS).map((n: any) => ({
    ...n,
    type: n.type || "system",
  }));

  const filtered = notifications.filter((n) => {
    if (activeTab === "Unread") return n.status === "Unread";
    if (activeTab === "Orders") return n.type === "order";
    if (activeTab === "System") return ["system", "stock", "payment"].includes(n.type);
    return true;
  });

  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.post("/seller/api/mark-notification-as-read", { notificationId });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = () =>
    Promise.all(notifications.filter((n) => n.status === "Unread").map((n) => markAsRead(n.id)));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full  px-2.5 py-0.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay updated on orders, stock, and platform activity
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            className="gap-1.5 rounded-xl border-[#dde1bc] bg-white text-sm hover:bg-[#f6f8ea]"
          >
            <CheckCheck size={13} /> Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-0.5 w-fit rounded-2xl border border-[#e0e4be] bg-white/70 p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative h-8 rounded-xl px-4 text-xs font-semibold transition-all ${activeTab === tab ? "seller-tab-active" : "seller-tab hover:text-foreground"
              }`}
          >
            {tab}
            {tab === "Unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full  px-1.5 py-0.5 text-[10px] font-bold text-white align-middle">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-[#86b81d]/30 border-t-[#86b81d] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0f4d8] mb-4">
            <Bell size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">No notifications here</p>
        </div>
      ) : (
        <div className="max-w-2xl bg-white rounded-[16px] border border-[#e8ebd4] shadow-sm overflow-hidden">
          {filtered.map((n) => {
            const meta = (TYPE_META[n.type] || TYPE_META.system)!;
            const isUnread = n.status === "Unread";
            return (
              <Link
                key={n.id}
                href={n.redirect_link || "#"}
                onClick={() => isUnread && markAsRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 border-b border-[#f0f2e0] last:border-0 transition-colors ${isUnread ? "bg-[#f8fbe8] hover:bg-[#f2f7d2]" : "hover:bg-[#fafbf3]"
                  }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${meta.bg}`}>
                  <meta.Icon size={15} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${isUnread ? "font-semibold text-[#17320f]" : "font-medium text-foreground/80"}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground/60 shrink-0">
                      {timeAgo(n.createdAt || n.cratedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                </div>
                {isUnread && <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full " />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Page;

