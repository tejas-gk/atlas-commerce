"use client";
import { useQuery } from "@tanstack/react-query";

import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import React from "react";
import BreadCrumbs from "@/shared/components/breadcrumbs";

const Page = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/seller/api/seller-notifications");
      return res.data.notifications;
    },
  });

  const markAsRead = async (notificationId: string) => {
    await axiosInstance.post("/seller/api/mark-notification-as-read", {
      notificationId,
    });
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <div>
        <h2 className="mb-2 text-3xl font-extrabold tracking-[-0.05em] text-[#17320f]">Notifications</h2>
        <BreadCrumbs title="Notifications" />
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="pt-24 text-center text-sm text-muted-foreground">
          No Notifications available yet!
        </p>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="seller-panel my-6 divide-y divide-[#ecefd8] rounded-[30px] md:w-[80%]">
          {data.map((d: any) => (
            <Link
              key={d.id}
              href={d.redirect_link}
              className={`block px-5 py-4 transition ${d.status !== "Unread"
                  ? "hover:bg-[#fbfced]"
                  : "bg-[#f8fbe8] hover:bg-[#f2f7d2]"
                }`}
              onClick={() => markAsRead(d.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-[#17320f]">{d.title}</span>
                  <span className="text-sm text-[#5f6e43]">{d.message}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {new Date(d.cratedAt).toLocaleString("en-UK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
