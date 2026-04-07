"use client";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import {
  Bell, CheckCircle2, ShoppingCart, CreditCard,
  AlertTriangle, CheckCheck, Info, Package,
} from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

const FILTER_TABS = ["All", "Unread", "Orders", "System"];

const getType = (title: string): "order" | "payment" | "alert" | "system" => {
  const t = title?.toLowerCase() ?? "";
  if (t.includes("order") || t.includes("purchase")) return "order";
  if (t.includes("payment") || t.includes("payout") || t.includes("earning")) return "payment";
  if (t.includes("alert") || t.includes("warn") || t.includes("stock")) return "alert";
  return "system";
};

const TYPE_CONFIG = {
  order:   { Icon: ShoppingCart, cls: "bg-rose-500/15 text-rose-400" },
  payment: { Icon: CreditCard,   cls: "bg-emerald-500/15 text-emerald-400" },
  alert:   { Icon: AlertTriangle, cls: "bg-amber-500/15 text-amber-400" },
  system:  { Icon: Info,          cls: "bg-blue-500/15 text-blue-400" },
};

const timeAgo = (dateStr: string) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications ?? [];
    },
  });

  const notifications: any[] = data ?? [];
  const unreadCount = notifications.filter((n) => n.status === "Unread").length;

  const markAsRead = async (id: string) => {
    await axiosInstance.post("/seller/api/mark-notification-as-read", { notificationId: id });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((n) => n.status === "Unread")) {
      await axiosInstance.post("/seller/api/mark-notification-as-read", { notificationId: n.id });
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const filtered = useMemo(() => {
    if (activeTab === "Unread") return notifications.filter((n) => n.status === "Unread");
    if (activeTab === "Orders") return notifications.filter((n) => getType(n.title) === "order");
    if (activeTab === "System") return notifications.filter((n) => ["system", "alert"].includes(getType(n.title)));
    return notifications;
  }, [notifications, activeTab]);

  const summaryStats = [
    {
      label: "New Orders",
      value: notifications.filter((n) => getType(n.title) === "order" && n.status === "Unread").length,
      Icon: ShoppingCart,
      iconCls: "bg-rose-500/15 text-rose-400",
    },
    {
      label: "Payments",
      value: notifications.filter((n) => getType(n.title) === "payment").length,
      Icon: CreditCard,
      iconCls: "bg-emerald-500/15 text-emerald-400",
    },
    {
      label: "System Alerts",
      value: notifications.filter((n) => ["system", "alert"].includes(getType(n.title))).length,
      Icon: AlertTriangle,
      iconCls: "bg-amber-500/15 text-amber-400",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Stay up to date with your store activity</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="outline" className="border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-medium px-2.5 py-1">
              {unreadCount} unread
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="gap-1.5 h-8 text-xs border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground"
            >
              <CheckCheck size={13} /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Summary stat tiles */}
      <div className="grid grid-cols-3 gap-4">
        {summaryStats.map(({ label, value, Icon, iconCls }) => (
          <Card key={label} className="border border-white/[0.08] bg-card/50 p-4 flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${iconCls}`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xl font-semibold tabular-nums">{value || "—"}</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500/30 border-t-rose-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="border border-white/[0.06] bg-card/50 flex flex-col items-center justify-center py-24">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] mb-4">
            <Bell size={24} className="text-muted-foreground/30" />
          </div>
          <p className="text-foreground/80 font-medium text-sm">All caught up</p>
          <p className="text-xs text-muted-foreground/50 mt-1">We&apos;ll notify you when something happens</p>
        </Card>
      ) : (
        <Card className="border border-white/[0.06] bg-card/50 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-0.5 px-4 py-3 border-b border-white/[0.05]">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-white/[0.06] text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "Unread" && unreadCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[9px] font-semibold px-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 size={24} className="text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground/50">No {activeTab.toLowerCase()} notifications</p>
            </div>
          ) : (
            filtered.map((n: any) => {
              const type = getType(n.title);
              const { Icon, cls } = TYPE_CONFIG[type];
              const isUnread = n.status === "Unread";
              return (
                <Link
                  key={n.id}
                  href={n.redirect_link || "#"}
                  onClick={() => isUnread && markAsRead(n.id)}
                  className={`flex items-start gap-4 py-4 px-5 border-b border-white/[0.04] last:border-0 transition-colors duration-150 hover:bg-white/[0.02] ${
                    isUnread ? "bg-rose-500/[0.025]" : ""
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 mt-0.5 ${cls}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className={`text-[13px] font-medium leading-snug ${isUnread ? "text-foreground" : "text-foreground/70"}`}>
                        {n.title}
                      </p>
                      {isUnread && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground/55 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/35 mt-1.5">{timeAgo(n.cratedAt)}</p>
                  </div>
                  {!isUnread && <CheckCircle2 size={14} className="text-muted-foreground/20 mt-1 shrink-0" />}
                </Link>
              );
            })
          )}
        </Card>
      )}
    </div>
  );
}
