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
                "group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors duration-150 cursor-pointer",
                danger
                    ? "text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
                    : "text-foreground/70 hover:bg-white/[0.05] hover:text-foreground",
                disabled && "pointer-events-none opacity-40"
            )}
            onClick={!href ? onClick : undefined}
        >
            <Icon size={14} className={cn("shrink-0", danger ? "text-red-400/70" : "text-foreground/40 group-hover:text-foreground/70")} />
            <span className="flex-1 font-medium">{label}</span>
            {badge && (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {badge}
                </span>
            )}
            {hint && (
                <kbd className="hidden rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 font-mono text-[10px] text-muted-foreground/60 sm:block">
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
        <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
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
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.04]  backdrop-blur-xl px-6">
            {/* Sidebar trigger */}
            <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="-ml-2 text-muted-foreground hover:text-foreground"
            >
                <Menu size={18} />
            </Button>
            <Separator orientation="vertical" className="h-5 bg-border/40" />

            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            href="/dashboard"
                            className="text-muted-foreground hover:text-foreground text-sm"
                        >
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    {currentPage !== "Dashboard" && (
                        <>
                            <BreadcrumbSeparator className="text-border" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-sm font-medium">{currentPage}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </>
                    )}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex-1" />

            {/* Search trigger */}
            <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 text-muted-foreground/60 text-[13px] h-8 w-64 justify-start border-border/40 bg-white/[0.03] hover:bg-white/[0.05] hover:text-foreground transition-colors duration-150"
            >
                <SearchIcon size={13} className="shrink-0" />
                <span>Search orders, products…</span>
                <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                    ⌘K
                </kbd>
            </Button>

            {/* Notification bell */}
            <Button
                variant="ghost"
                size="icon"
                asChild
                className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
            >
                <Link href="/dashboard/notifications">
                    <BellIcon size={16} />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-emerald-600/90 border-0">
                        3
                    </Badge>
                </Link>
            </Button>

            {/* ── Profile dropdown ─────────────────────────────────────────────── */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-8 w-8 ring-1 ring-border/40 hover:ring-emerald-500/40 transition-all duration-150"
                    >
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-emerald-600/90 text-white text-xs font-semibold">
                                {sellerInitial}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-72 rounded-xl border border-white/[0.08] bg-[#101926] p-2 shadow-2xl shadow-black/60 ring-1 ring-white/[0.04]"
                >
                    {/* ── Identity card ── */}
                    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 mb-2">
                        <div className="relative shrink-0">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-emerald-600/90 text-white text-sm font-semibold">
                                    {sellerInitial}
                                </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#101926] bg-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">{sellerName}</p>
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                                    <Zap size={8} className="fill-emerald-300" />
                                    Pro
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{sellerEmail}</p>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground/60">
                                <Store size={10} />
                                <span className="truncate">{shopName}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Account ── */}
                    <MenuSection label="Account" />
                    <MenuRow icon={UserIcon} label="Edit Profile" href="/edit-profile" />
                    <MenuRow icon={SlidersHorizontal} label="Settings" href="/dashboard/settings" />
                    <MenuRow icon={CreditCard} label="Billing & Plan" href="/dashboard/settings" badge="Pro" />

                    <DropdownMenuSeparator className="my-1.5 bg-white/[0.05]" />

                    {/* ── Store ── */}
                    <MenuSection label="Store" />
                    <MenuRow icon={Store} label="Store Settings" href="/dashboard/settings" />
                    <MenuRow
                        icon={ChevronRight}
                        label="View Storefront"
                        href="#"
                        badge="↗"
                    />

                    <DropdownMenuSeparator className="my-1.5 bg-white/[0.05]" />

                    {/* ── Support ── */}
                    <MenuSection label="Support" />
                    <MenuRow icon={BookOpen} label="Documentation" href="#" />
                    <MenuRow icon={LifeBuoy} label="Help & Support" href="#" />

                    <DropdownMenuSeparator className="my-1.5 bg-white/[0.05]" />

                    {/* ── Sign out ── */}
                    <MenuRow icon={LogOut} label="Sign out" onClick={handleLogout} danger />

                    {/* ── Footer ── */}
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span className="text-[10px] text-muted-foreground/60">All systems operational</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/40">v1.0.0</span>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
