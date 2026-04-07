"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";
import {
  ChevronsUpDown,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  PackagePlus,
  Boxes,
  CalendarPlus,
  CalendarDays,
  Inbox,
  Bell,
  Settings,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import useRequireAuth from "@/hooks/useRequiredAuth";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navData: NavSection[] = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard",  href: "/dashboard",          icon: LayoutDashboard },
      { title: "Orders",     href: "/dashboard/orders",   icon: ShoppingBag },
      { title: "Payments",   href: "/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    label: "Products",
    items: [
      { title: "Create Product", href: "/dashboard/create-product", icon: PackagePlus },
      { title: "All Products",   href: "/dashboard/all-products",   icon: Boxes },
    ],
  },
  {
    label: "Events",
    items: [
      { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
      { title: "All Events",   href: "/dashboard/all-events",   icon: CalendarDays },
    ],
  },
  {
    label: "Controllers",
    items: [
      { title: "Inbox",          href: "/dashboard/inbox",          icon: Inbox },
      { title: "Notifications",  href: "/dashboard/notifications",  icon: Bell },
      { title: "Settings",       href: "/dashboard/settings",       icon: Settings },
      { title: "Discount Codes", href: "/dashboard/discount-codes", icon: Tag },
    ],
  },
];

const SellerSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller, switchShop, isSwitchingShop } = useRequireAuth();

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
  const shopName = seller?.shop?.name ?? "My Store";

  return (
    <Sidebar className="border-r border-white/[0.04]">
      {/* Store header */}
      <SidebarHeader className="h-14 border-b border-white/[0.04] flex-row items-center px-2 py-0 gap-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent/50 transition-colors duration-150">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600/90 text-white shrink-0">
                    <span className="text-xs font-semibold">{shopInitial}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm text-sidebar-foreground">{shopName}</span>
                    <span className="text-[11px] text-sidebar-foreground/40">Seller Dashboard</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                {seller?.shops?.map((shop: any) => (
                  <DropdownMenuItem
                    key={shop.id}
                    disabled={isSwitchingShop}
                    onSelect={() => switchShop(shop.id)}
                    className={(seller?.activeShopId ?? seller?.shop?.id) === shop.id ? "font-semibold text-rose-400" : ""}
                  >
                    {shop.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="pt-2">
        {navData.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-1">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-rose-600/10 text-rose-400 hover:bg-rose-600/15 hover:text-rose-400 font-medium transition-colors duration-150"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors duration-150"
                        }
                      >
                        <Link href={item.href} className="flex items-center gap-2.5">
                          <Icon
                            size={15}
                            className={isActive ? "text-rose-400" : "text-sidebar-foreground/35"}
                          />
                          <span className="text-[13px]">{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — logout */}
      <SidebarFooter className="border-t border-white/[0.04] pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/8 transition-colors duration-150"
            >
              <LogOut size={15} />
              <span className="text-[13px]">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default SellerSidebar;
