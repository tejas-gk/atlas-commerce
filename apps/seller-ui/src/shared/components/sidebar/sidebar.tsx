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
  Pencil,
  PlusCircle,
  ExternalLink,
  Sparkles,
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
      { title: "Edit Product", href: "/dashboard/edit-product", icon: Pencil },
      { title: "All Products", href: "/dashboard/all-products", icon: Boxes },
    ],
  },
  {
    label: "Events",
    items: [
      { title: "Create Event", href: "/dashboard/create-event", icon: CalendarPlus },
      { title: "Edit Event", href: "/dashboard/edit-event", icon: Pencil },
      { title: "All Events", href: "/dashboard/all-events", icon: CalendarDays },
    ],
  },
  {
    label: "Controllers",
    items: [
      { title: "Inbox", href: "/dashboard/inbox", icon: Inbox },
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "App Platform", href: "/dashboard/app-platform", icon: SlidersHorizontal },
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
        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-150",
        isActive
          ? "border border-lime-300/70 bg-lime-100/80 shadow-[0_10px_24px_rgba(132,178,31,0.14)]"
          : "border border-transparent hover:border-lime-200/70 hover:bg-white/80 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-bold",
          isActive ? "bg-lime-500 text-white" : "bg-[#1f3b16] text-white"
        )}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">
          {shop.name}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isActive ? "bg-lime-500" : "bg-muted-foreground/30"
            )}
          />
          <span className="text-[10px] text-muted-foreground/70">
            {isActive ? "Active" : "Switch"}
          </span>
        </div>
      </div>

      {isActive && (
        <Check size={14} className="shrink-0 text-lime-600" />
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
    <Sidebar className="border-r border-[#d8dbbb]">
      <SidebarHeader className="flex h-auto flex-col gap-3 border-b border-[#dde0be] px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="seller-soft-panel h-auto rounded-[24px] px-3 py-3 hover:bg-white/90"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-lime-500 text-white shrink-0 shadow-[0_10px_24px_rgba(132,178,31,0.22)]">
                    <span className="text-sm font-semibold">{shopInitial}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-semibold text-[#17320f]">
                      {shopName}
                    </span>
                    <span className="text-[11px] text-[#687259]">
                      Seller dashboard
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-3.5 text-[#7c8669]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="w-72 rounded-[26px] border border-[#d9ddb8] bg-[#fffdf4] p-2.5 shadow-[0_24px_60px_rgba(103,97,40,0.16)]"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b7f59]">
                    Your Stores
                  </span>
                  <span className="rounded-full border border-[#dde1b8] bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#697354]">
                    {shops.length} store{shops.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="mb-1.5 rounded-[22px] border border-[#d9ddb8] bg-[#f7fbdf] p-3 text-black ">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px]
                     bg-lime-500 text-white text-sm font-bold">
                      {shopInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {shopName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-lime-700">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime-500" />
                          Live
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] text-muted-foreground/60">Priority slotting</span>
                      </div>
                    </div>
                    <Check size={13} className="shrink-0 text-lime-600" />
                  </div>
                </div>

                {shops.length > 1 && (
                  <>
                    <p className="px-1 py-1 text-[10px] font-medium text-muted-foreground/50">
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

                <DropdownMenuSeparator className="my-2 bg-[#e6e7cf]" />

                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] text-foreground/70 transition-colors hover:bg-[#f7f8ea] hover:text-foreground"
                  >
                    <SlidersHorizontal size={13} className="shrink-0 text-foreground/40" />
                    <span>Store Settings</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] text-foreground/70 transition-colors hover:bg-[#f7f8ea] hover:text-foreground"
                  >
                    <ExternalLink size={13} className="shrink-0 text-foreground/40" />
                    <span>View Storefront</span>
                    <span className="ml-auto rounded-md border border-[#dfe3bc] bg-white px-1 text-[10px] text-muted-foreground/50">
                      ↗
                    </span>
                  </Link>
                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] text-muted-foreground/40"
                  >
                    <PlusCircle size={13} className="shrink-0" />
                    <span>Add New Store</span>
                    <span className="ml-auto rounded-full border border-[#dfe3bc] bg-white px-1.5 py-0.5 text-[10px] text-muted-foreground/50">
                      Soon
                    </span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-3">
        {navData.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="mb-2 px-4 text-[10px] uppercase tracking-[0.22em] text-[#8b8e67]">
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
                            ? "mx-2 rounded-[22px] border border-lime-300/70 bg-white text-[#17320f] shadow-[0_12px_28px_rgba(132,178,31,0.12)] hover:bg-white font-medium transition-colors duration-150"
                            : "mx-2 rounded-[22px] text-[#6e7556] hover:text-[#17320f] hover:bg-white/75 transition-colors duration-150"
                        }
                      >
                        <Link href={item.href} className="flex items-center gap-2.5">
                          <Icon
                            size={15}
                            className={isActive ? "text-lime-600" : "text-[#8d916f]"}
                          />
                          <span className="text-[13px]">{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-lime-500" />
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

      <SidebarFooter className="border-t border-[#dde0be] pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="mx-2 rounded-[22px] text-[#7f8464] hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
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
