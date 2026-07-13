"use client";

import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import SidebarWrapper from "../../shared/components/sidebar";
import useAdmin from "@/hooks/useAdmin";
import { ThemeToggle } from "@workspace/ui/components/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { admin } = useAdmin();

  return (
    <div className="admin-shell min-h-screen">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#17320f]/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#e7e9ec] bg-white transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          aria-label="Close menu"
          className="absolute right-3 top-3 rounded-full p-2 text-[#667052] hover:bg-white lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X size={18} />
        </button>
        <SidebarWrapper onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="min-w-0 lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[#e7e9ec] bg-white/80 px-4 backdrop-blur-xl sm:px-7">
          <button
            aria-label="Open navigation"
            className="rounded-xl border border-[#e2e5ca] bg-white p-2.5 text-[#17320f] lg:hidden"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={19} />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#818970]"
              size={17}
            />
            <input
              className="h-10 w-full rounded-lg border border-[#d8dce1] bg-white pl-10 pr-4 text-sm text-[#212b36] outline-none placeholder:text-[#919eab] focus:border-[#637381] focus:ring-4 focus:ring-slate-200/60"
              placeholder="Search orders, sellers, products..."
            />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <ThemeToggle className="border-[#e2e5ca] bg-white text-[#526044] hover:border-lime-300 dark:border-[#34452f] dark:bg-[#172518] dark:text-[#e7ecd9]" />
            <button
              aria-label="Notifications"
              className="relative rounded-lg border border-[#e1e4e8] bg-white p-2.5 text-[#637381] transition hover:border-[#919eab] hover:bg-[#f4f6f8] hover:text-[#212b36]"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#ff6b35]" />
            </button>
            <div className="flex items-center gap-2.5 rounded-lg border border-[#e1e4e8] bg-white py-1.5 pl-1.5 pr-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#17320f] text-xs font-bold text-white">
                {admin?.name?.[0]?.toUpperCase() || "A"}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold text-[#17320f]">
                  {admin?.name || "Admin"}
                </p>
                <p className="text-[10px] text-[#7d856f]">Platform admin</p>
              </div>
            </div>
          </div>
        </header>
        <main className="relative min-h-[calc(100vh-72px)]">{children}</main>
      </div>
    </div>
  );
}
