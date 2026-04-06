"use client";

import React from "react";
import Link from "next/link";
import { BellIcon, SearchIcon } from "lucide-react";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import useSeller from "@/hooks/useSeller";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

export function SellerSiteHeader() {
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axiosInstance.get("/api/logout-seller");
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sellerInitial = seller?.name?.[0]?.toUpperCase() ?? "S";

  // Derive breadcrumb from current pathname
  const segments = pathname.replace("/dashboard", "").split("/").filter(Boolean);
  const currentPage = segments.length > 0
    ? segments[segments.length - 1]!.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.04] bg-background/90 backdrop-blur-xl px-6">
      {/* Sidebar trigger */}
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />

      <Separator orientation="vertical" className="h-5 bg-border/40" />

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {currentPage !== "Dashboard" && (
            <>
              <BreadcrumbSeparator className="text-border" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">{currentPage}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {currentPage === "Dashboard" && (
            <BreadcrumbItem>
              <BreadcrumbPage className="sr-only">Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Spacer */}
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
      <Button variant="ghost" size="icon" asChild className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard/notifications">
          <BellIcon size={16} />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-rose-600/90 border-0">
            3
          </Badge>
        </Link>
      </Button>

      {/* Avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ring-1 ring-border/40 hover:ring-rose-500/30 transition-all duration-150">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-rose-600/90 text-white text-xs font-semibold">
                {sellerInitial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="pb-2">
            <p className="font-semibold text-sm">{seller?.name ?? "Seller"}</p>
            <p className="text-xs text-muted-foreground font-normal truncate">{seller?.email ?? ""}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/edit-profile">Edit Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
