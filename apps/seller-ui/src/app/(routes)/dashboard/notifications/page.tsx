"use client";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import React from "react";
import { Bell } from "lucide-react";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";

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
        <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
        <p className="text-white/35 text-sm mt-0.5">Stay up to date with your store activity</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <Card className="bg-white/5 border-white/8 flex flex-col items-center justify-center py-20">
          <Bell size={36} className="text-white/15 mb-3" />
          <p className="text-white/25 text-sm">No notifications yet</p>
        </Card>
      )}

      {!isLoading && data?.length > 0 && (
        <Card className="bg-white/5 border-white/8 overflow-hidden">
          {data.map((n: any, i: number) => (
            <Link
              key={n.id}
              href={n.redirect_link}
              onClick={() => markAsRead(n.id)}
              className={`flex items-start gap-4 border-b border-white/5 py-4 px-5 transition-colors hover:bg-white/3 ${
                n.status === "Unread" ? "bg-violet-500/5" : ""
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.status === "Unread" ? "bg-violet-500" : "bg-white/10"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{n.title}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-white/30 text-xs mt-1.5">
                  {new Date(n.cratedAt).toLocaleString("en-UK", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              {n.status === "Unread" && (
                <Badge className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-semibold flex-shrink-0 mt-0.5">
                  NEW
                </Badge>
              )}
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
