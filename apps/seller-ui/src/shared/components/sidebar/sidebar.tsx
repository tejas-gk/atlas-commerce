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
  Check,
  SlidersHorizontal,
  PlusCircle,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
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
import { cn } from "@workspace/ui/lib/utils";
import useRequireAuth from "@/hooks/useRequiredAuth";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";

interface NavItem { title: string; href: string; icon: LucideIcon }
interface NavSection { label: string; items: NavItem[] }

const navData: NavSection[] = [
  {
    label: "Main Menu",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    ],
  },
  {
    label: "Products",
    items: [
      { title: "Create Product", href: "/dashboard/create-product", icon: PackagePlus },
      { title: "All Products", href: "/dashboard/all-products", icon: Boxes },
    ],
  },
  {
    label: "Events",
    items: [
      { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
      { title: "All Events", href: "/dashboard/all-events", icon: CalendarDays },
    ],
  },
  {
    label: "Controllers",
    items: [
      { title: "Inbox", href: "/dashboard/inbox", icon: Inbox },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
      { title: "Discount Codes", href: "/dashboard/discount-codes", icon: Tag },
    ],
  },
];

// ── Store card used inside the switcher pop-up ────────────────────────────
function StoreCard({
  shop,
  isActive,
  isSwitching,
  onSelect,
}: {
  shop: { id: string; name: string };
  isActive: boolean;
  isSwitching: boolean;
  onSelect: () => void;
}) {
  const initial = shop.name?.[0]?.toUpperCase() ?? "S";
  return (
    <button
      type="button"
      disabled={isSwitching || isActive}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150",
        isActive
          ? "bg-emerald-500/12 ring-1 ring-emerald-500/30"
          : "hover:bg-white/[0.05] cursor-pointer"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white",
          isActive ? "bg-emerald-600" : "bg-white/10"
        )}
      >
        {initial}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground/90">
          {shop.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isActive ? "bg-emerald-400" : "bg-muted-foreground/30"
            )}
          />
          <span className="text-[10px] text-muted-foreground/60">
            {isActive ? "Active" : "Switch"}
          </span>
        </div>
      </div>

      {/* Active check */}
      {isActive && (
        <Check size={13} className="shrink-0 text-emerald-400" />
      )}
    </button>
  );
}

const SellerSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { seller, switchShop, isSwitchingShop } = useRequireAuth();

  const handleLogout = async () => {
    sessionStorage.removeItem("__atlas_dev__");
    try {
      await axiosInstance.get("/auth/api/logout-seller");
    } catch {
      // ignore when server is offline
    } finally {
      queryClient.clear();
      router.push("/login");
    }
  };

  const shopInitial = seller?.shop?.name?.[0]?.toUpperCase() ?? "S";
  const shopName = seller?.shop?.name ?? "My Store";
  const activeShopId = seller?.activeShopId ?? seller?.shop?.id;
  const shops: Array<{ id: string; name: string }> = seller?.shops ?? [];

  return (
    <Sidebar className="border-r border-white/[0.04]">

      {/* ── Store header / switcher ─────────────────────────────────────── */}
      <SidebarHeader className="h-14 border-b border-white/[0.04] flex-row items-center px-2 py-0 gap-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/90 text-white shrink-0">
                    <span className="text-xs font-semibold">{shopInitial}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold text-sm text-sidebar-foreground">
                      {shopName}
                    </span>
                    <span className="text-[11px] text-sidebar-foreground/40">
                      Seller Dashboard
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-3.5 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              {/* ── Store switcher pop-up ─────────────────────────────── */}
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="w-72 rounded-xl border border-white/[0.08] bg-[#101926] p-2 shadow-2xl shadow-black/60 ring-1 ring-white/[0.04]"
              >
                {/* Header */}
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Your Stores
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/60">
                    {shops.length} store{shops.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Active store highlight */}
                <div className="mb-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/90 text-white text-sm font-bold">
                      {shopInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {shopName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400/80">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                          Live
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">·</span>
                        <span className="text-[10px] text-muted-foreground/50">Pro Plan</span>
                      </div>
                    </div>
                    <Check size={13} className="shrink-0 text-emerald-400" />
                  </div>
                </div>

                {/* Other stores (when more than one exists) */}
                {shops.length > 1 && (
                  <>
                    <p className="px-1 py-1 text-[10px] font-medium text-muted-foreground/40">
                      Switch to
                    </p>
                    <div className="space-y-0.5">
                      {shops
                        .filter((s) => s.id !== activeShopId)
                        .map((shop) => (
                          <StoreCard
                            key={shop.id}
                            shop={shop}
                            isActive={false}
                            isSwitching={isSwitchingShop}
                            onSelect={() => switchShop(shop.id)}
                          />
                        ))}
                    </div>
                  </>
                )}

                <DropdownMenuSeparator className="my-2 bg-white/[0.05]" />

                {/* Quick actions */}
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-foreground/70 transition-colors hover:bg-white/[0.05] hover:text-foreground"
                  >
                    <SlidersHorizontal size={13} className="shrink-0 text-foreground/40" />
                    <span>Store Settings</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-foreground/70 transition-colors hover:bg-white/[0.05] hover:text-foreground"
                  >
                    <ExternalLink size={13} className="shrink-0 text-foreground/40" />
                    <span>View Storefront</span>
                    <span className="ml-auto rounded border border-white/10 bg-white/[0.04] px-1 text-[10px] text-muted-foreground/50">
                      ↗
                    </span>
                  </Link>
                  <button
                    type="button"
                    disabled
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-muted-foreground/40 cursor-not-allowed"
                  >
                    <PlusCircle size={13} className="shrink-0" />
                    <span>Add New Store</span>
                    <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground/50">
                      Soon
                    </span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
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
                            ? "bg-emerald-600/12 text-emerald-400 hover:bg-emerald-600/16 hover:text-emerald-300 font-medium transition-colors duration-150"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors duration-150"
                        }
                      >
                        <Link href={item.href} className="flex items-center gap-2.5">
                          <Icon
                            size={15}
                            className={isActive ? "text-emerald-400" : "text-sidebar-foreground/35"}
                          />
                          <span className="text-[13px]">{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
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

      {/* ── Footer logout ───────────────────────────────────────────────── */}
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
