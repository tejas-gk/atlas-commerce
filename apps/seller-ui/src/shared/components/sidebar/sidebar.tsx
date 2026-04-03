"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Link from "next/link";
import {
  BellRing,
  CalendarPlus,
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
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
      { title: "Create Product", href: "/dashboard/create-product", icon: SquarePlus   },
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
      { title: "Inbox",          href: "/dashboard/inbox",           icon: Mail         },
      { title: "Notifications",  href: "/dashboard/notifications",   icon: BellRing     },
      { title: "Settings",       href: "/dashboard/settings",        icon: Settings     },
      { title: "Discount Codes", href: "/dashboard/discount-codes",  icon: TicketPercent},
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
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#0a0a0a]">
      {/* Header — shop identity */}
      <SidebarHeader className="border-b border-white/5 px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/5 transition-colors">
              <Link href="/dashboard">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                  {shopInitial}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">{shopName}</span>
                  <span className="truncate text-[10px] text-white/40">Seller Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav groups */}
      <SidebarContent className="py-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-white/25 text-[9px] font-semibold tracking-widest uppercase px-3 mb-1">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = activeSidebar === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`mx-1 rounded-lg transition-all text-white/50 hover:text-white hover:bg-white/5 ${
                        isActive
                          ? "bg-violet-600/15 text-violet-400 hover:bg-violet-600/20 hover:text-violet-300 shadow-[inset_2px_0_0_#7c3aed]"
                          : ""
                      }`}
                    >
                      <Link href={item.href}>
                        <Icon size={15} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — logout */}
      <SidebarFooter className="border-t border-white/5 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="mx-1 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={15} />
              <span className="text-sm">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default SellerSidebar;
