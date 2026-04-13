"use client";

import React from "react";
import Link from "next/link";
import {
    BellIcon,
    SearchIcon,
    UserIcon,
    SlidersHorizontal,
    CreditCard,
    BookOpen,
    LifeBuoy,
    LogOut,
    Store,
    Zap,
    ChevronRight,
    CheckCircle2,
    Menu,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@workspace/ui/components/sidebar";
import useSeller from "@/hooks/useSeller";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

// ── Reusable menu row ──────────────────────────────────────────────────────
function MenuRow({
    icon: Icon,
    label,
    hint,
    href,
    onClick,
    danger = false,
    disabled = false,
    badge,
}: {
    icon: React.ElementType;
    label: string;
    hint?: string;
    href?: string;
    onClick?: () => void;
    danger?: boolean;
    disabled?: boolean;
    badge?: string;
}) {
    const inner = (
        <div
            className={cn(
                "group flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 text-[13px] transition-colors duration-150",
                danger
                    ? "text-red-500/80 hover:bg-red-50 hover:text-red-500"
                    : "text-foreground/70 hover:bg-[#f7f8ea] hover:text-foreground",
                disabled && "pointer-events-none opacity-40"
            )}
            onClick={!href ? onClick : undefined}
        >
            <Icon size={14} className={cn("shrink-0", danger ? "text-red-500/70" : "text-foreground/40 group-hover:text-foreground/70")} />
            <span className="flex-1 font-medium">{label}</span>
            {badge && (
                <span className="rounded-full border border-[#dfe3bc] bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {badge}
                </span>
            )}
            {hint && (
                <kbd className="hidden rounded-full border border-[#dfe3bc] bg-white px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 sm:block">
                    {hint}
                </kbd>
            )}
        </div>
    );

    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ── Menu section label ─────────────────────────────────────────────────────
function MenuSection({ label }: { label: string }) {
    return (
        <p className="px-3 pb-0.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/50">
            {label}
        </p>
    );
}

export function SellerSiteHeader() {
    const { seller } = useSeller();
    const queryClient = useQueryClient();
    const { toggleSidebar } = useSidebar();
    const router = useRouter();
    const pathname = usePathname();

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

    const sellerInitial = seller?.name?.[0]?.toUpperCase() ?? "S";
    const sellerName = seller?.name ?? "Seller";
    const sellerEmail = seller?.email ?? "";
    const shopName = seller?.shop?.name ?? "My Store";

    // Breadcrumb
    const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
    const currentPage =
        segments.length > 0
            ? segments[segments.length - 1]!
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "Dashboard";

    return (
        <header className="sticky top-0 z-10 mx-auto flex h-auto max-w-[1480px] items-center gap-3 rounded-b-[28px] border border-t-0 border-[#dde0be] bg-[rgba(255,252,239,0.92)] px-4 py-3 shadow-[0_18px_44px_rgba(108,101,46,0.08)] backdrop-blur-xl">
            <SidebarTrigger className="-ml-1 rounded-2xl text-[#6b7450] hover:text-[#17320f]" />
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="-ml-2 rounded-2xl text-[#6b7450] hover:bg-white hover:text-[#17320f]"
            >
                <Menu size={18} />
            </Button>
            <Separator orientation="vertical" className="h-6 bg-[#d9ddbd]" />

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/dashboard"
                            className="text-sm text-[#697254] hover:text-[#17320f]"
                        >
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {currentPage !== "Dashboard" && (
                        <>
                            <BreadcrumbSeparator className="text-[#b4b98f]" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm font-semibold text-[#17320f]">{currentPage}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex-1" />

            <Button
                variant="outline"
                className="hidden h-10 w-72 items-center justify-start gap-2 rounded-[20px] border-[#dde0be] bg-white/90 text-[13px] text-[#6c7553] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-colors duration-150 hover:bg-white hover:text-[#17320f] md:flex"
            >
                <SearchIcon size={13} className="shrink-0" />
                <span>Search orders, products…</span>
                <kbd className="ml-auto pointer-events-none hidden h-6 select-none items-center gap-1 rounded-full border border-[#e0e2c4] bg-[#fbf8eb] px-2 font-mono text-[10px] font-medium text-[#7c8564] sm:flex">
                    ⌘K
                </kbd>
            </Button>

            <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative h-10 w-10 rounded-[18px] border border-[#dde0be] bg-white/80 text-[#68724d] hover:bg-white hover:text-[#17320f]"
            >
                <Link href="/dashboard/notifications">
                    <BellIcon size={16} />
                    <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-0 bg-lime-500 p-0 text-[10px] text-white">
                        3
                    </Badge>
                </Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full border border-[#dde0be] bg-white/85 transition-all duration-150 hover:border-lime-300 hover:bg-white"
                    >
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#1f3b16] text-xs font-semibold text-white">
                                {sellerInitial}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-72 rounded-[26px] border border-[#d9ddb8] bg-[#fffdf4] p-2.5 shadow-[0_24px_60px_rgba(103,97,40,0.16)]"
                >
                    <div className="mb-2 flex items-center gap-3 rounded-[22px] border border-[#d9ddb8] bg-[#f7fbdf] p-3">
                        <div className="relative shrink-0">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-lime-500 text-sm font-semibold text-white">
                                    {sellerInitial}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#f7fbdf] bg-lime-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-semibold text-foreground">{sellerName}</p>
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-lime-300 bg-lime-100 px-1.5 py-0.5 text-[10px] font-semibold text-lime-700">
                                    <Zap size={8} className="fill-lime-700" />
                                    Fast
                                </span>
                            </div>
                            <p className="truncate text-[11px] text-muted-foreground">{sellerEmail}</p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/70">
                                <Store size={10} />
                                <span className="truncate">{shopName}</span>
                            </div>
                        </div>
                    </div>

                    <MenuSection label="Account" />
                    <MenuRow icon={UserIcon} label="Edit Profile" href="/edit-profile" />
                    <MenuRow icon={SlidersHorizontal} label="Settings" href="/dashboard/settings" />
                    <MenuRow icon={CreditCard} label="Billing & Plan" href="/dashboard/settings" badge="Live" />

                    <DropdownMenuSeparator className="my-1.5 bg-[#e6e7cf]" />

                    <MenuSection label="Store" />
                    <MenuRow icon={Store} label="Store Settings" href="/dashboard/settings" />
                    <MenuRow
                        icon={ChevronRight}
                        label="View Storefront"
                        href="#"
                        badge="↗"
                    />

                    <DropdownMenuSeparator className="my-1.5 bg-[#e6e7cf]" />

                    <MenuSection label="Support" />
                    <MenuRow icon={BookOpen} label="Documentation" href="#" />
                    <MenuRow icon={LifeBuoy} label="Help & Support" href="#" />

                    <DropdownMenuSeparator className="my-1.5 bg-[#e6e7cf]" />

                    <MenuRow icon={LogOut} label="Sign out" onClick={handleLogout} danger />

                    <div className="mt-2 flex items-center justify-between rounded-[18px] border border-[#dfe3bc] bg-white px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={11} className="text-lime-600" />
                            <span className="text-[10px] text-muted-foreground/70">All systems operational</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50">v1.0.0</span>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
