"use client";

import React from "react";
import Link from "next/link";
import { BellIcon, SearchIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import useSeller from "@/hooks/useSeller";
import axiosInstance from "@/utils/axiosInstance";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function SellerSiteHeader() {
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const router = useRouter();

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

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 bg-[#111111] px-4 transition-all duration-300 ease-in-out">
      <SidebarTrigger className="-ml-1 text-white/40 hover:text-white hover:bg-white/5 transition-colors rounded-lg" />
      <Separator orientation="vertical" className="mx-2 h-4 bg-white/5 data-[orientation=vertical]:h-4" />

      {/* Search */}
      <div className="relative hidden md:flex items-center w-64">
        <SearchIcon className="absolute left-2.5 size-3.5 text-white/25 pointer-events-none" />
        <Input
          placeholder="Search orders, products…"
          className="pl-8 h-8 bg-white/5 border-white/10 text-white/70 placeholder:text-white/25 focus-visible:ring-violet-500 focus-visible:border-violet-500/50 text-sm rounded-lg"
        />
      </div>

      {/* Right section */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notification bell */}
        <Button variant="ghost" size="icon" asChild
          className="relative text-white/40 hover:text-white hover:bg-white/5 transition-colors h-8 w-8 rounded-lg">
          <Link href="/dashboard/notifications">
            <BellIcon size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(124,58,237,0.8)]" />
          </Link>
        </Button>

        {/* Avatar + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"
              className="rounded-full h-8 w-8 hover:bg-white/5 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-pink-500 text-white text-[10px] font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                  {sellerInitial}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-[#111111] border-white/10 text-white/80">
            <DropdownMenuLabel className="pb-2">
              <p className="font-semibold text-sm text-white">{seller?.name ?? "Seller"}</p>
              <p className="text-xs text-white/40 font-normal truncate">{seller?.email ?? ""}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer">
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer">
              <Link href="/edit-profile">Edit Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
