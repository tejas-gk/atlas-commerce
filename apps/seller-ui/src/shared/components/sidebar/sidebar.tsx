"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarPlus,
  ChevronsUpDown,
  Home,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  PartyPopper,
  Settings,
  SquarePlus,
  TicketPercent,
  BellPlus,
} from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import useSidebar from "@/hooks/useSidebar.tsx";
import useRequireAuth from "@/hooks/useRequiredAuth";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";

const navGroups = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard",   href: "/dashboard",          icon: Home         },
      { title: "Orders",      href: "/dashboard/orders",   icon: ListOrdered  },
      { title: "Payments",    href: "/dashboard/payments", icon: PartyPopper  },
    ],
  },
  {
    label: "Products",
    items: [
      { title: "Create Product", href: "/dashboard/create-product", icon: SquarePlus    },
      { title: "All Products",   href: "/dashboard/all-products",   icon: PackageSearch },
    ],
  },
  {
    label: "Events",
    items: [
      { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
      { title: "All Events",   href: "/dashboard/all-events",   icon: BellPlus     },
    ],
  },
  {
    label: "Controllers",
    items: [
      { title: "Inbox",          href: "/dashboard/inbox",           icon: Mail          },
      { title: "Notifications",  href: "/dashboard/notifications",   icon: BellRing      },
      { title: "Settings",       href: "/dashboard/settings",        icon: Settings      },
      { title: "Discount Codes", href: "/dashboard/discount-codes",  icon: TicketPercent },
    ],
  },
];

const SellerSidebar = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller } = useRequireAuth();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/logout-seller");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const shopInitial = seller?.shop?.name?.[0]?.toUpperCase() ?? "S";
  const shopName    = seller?.shop?.name ?? "My Store";

  return (
    <div className="bg-[#0a0a0a] border-r border-white/5 h-screen flex flex-col w-[220px] shrink-0">
      {/* Store header */}
      <div className="mx-3 mt-3 mb-2 p-3 bg-white/5 rounded-xl border border-white/8
                      flex items-center gap-3 cursor-pointer hover:bg-white/8 transition-all">
        <Avatar className="w-8 h-8 rounded-lg shrink-0">
          <AvatarFallback className="bg-violet-600 text-white text-xs font-bold rounded-lg">
            {shopInitial}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{shopName}</p>
          <p className="text-white/40 text-xs">Seller Dashboard</p>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-white/30 shrink-0" />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            {gi > 0 && (
              <Separator className="opacity-10 my-2 mx-3" />
            )}
            <p className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-4 mb-1 mt-4">
              {group.label}
            </p>
            {group.items.map((item) => {
              const isActive = activeSidebar === item.href;
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? "text-white font-medium bg-white/8 border-l-2 border-violet-500"
                          : "text-white/50 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white/70" : "text-white/40"}`} />
                      {item.title}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#111] border-white/10 text-white text-xs">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout — pinned bottom */}
      <div className="border-t border-white/5 p-3 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg
                     text-white/40 text-sm hover:text-red-400 hover:bg-red-500/5
                     transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SellerSidebar;
