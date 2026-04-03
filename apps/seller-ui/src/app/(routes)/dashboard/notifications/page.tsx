"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import React from "react";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications;
    },
  });

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.post("/seller/api/mark-notification-as-read", { notificationId });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">Notifications</h1>
        <p className="text-white/35 text-sm mt-0.5">Stay up to date with your store activity</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md flex flex-col items-center justify-center py-20">
          <Bell size={36} className="text-white/15 mb-3" />
          <p className="text-white/25 text-sm">No notifications yet</p>
        </div>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/3 backdrop-blur-md overflow-hidden">
          {data.map((n: any, i: number) => (
            <Link
              key={n.id}
              href={n.redirect_link}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/3 ${
                i < data.length - 1 ? "border-b border-white/5" : ""
              } ${n.status === "Unread" ? "bg-violet-500/5" : ""}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.status === "Unread" ? "bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]" : "bg-white/10"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{n.title}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-white/25 text-[11px] mt-1.5">
                  {new Date(n.cratedAt).toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              {n.status === "Unread" && (
                <span className="text-[10px] font-semibold tracking-wide text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">
                  NEW
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
