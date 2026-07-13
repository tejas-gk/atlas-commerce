"use client";

import { usePathname } from "next/navigation";
import { Bell, CalendarDays, CreditCard, FileClock, LayoutDashboard, LogOut, PackageSearch, PencilRuler, Settings, ShoppingBag, Store, Users } from "lucide-react";
import useAdmin from "@/hooks/useAdmin";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";

const sections = [
  { title: "Overview", items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
  { title: "Commerce", items: [
    { title: "Orders", href: "/dashboard/orders", icon: ShoppingBag }, { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { title: "Products", href: "/dashboard/products", icon: PackageSearch }, { title: "Events", href: "/dashboard/events", icon: CalendarDays },
    { title: "Users", href: "/dashboard/users", icon: Users }, { title: "Sellers", href: "/dashboard/sellers", icon: Store },
  ]},
  { title: "Operations", items: [
    { title: "Loggers", href: "/dashboard/loggers", icon: FileClock }, { title: "Management", href: "/dashboard/management", icon: Settings },
    { title: "Notifications", href: "/dashboard/notifications", icon: Bell }, { title: "Customization", href: "/dashboard/customization", icon: PencilRuler },
  ]},
];

export default function SidebarWrapper({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin } = useAdmin();
  return (
    <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
      <div className="mb-2 flex items-center gap-3 px-2 py-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f8d84a] shadow-[0_10px_25px_rgba(209,174,20,.22)]"><ShoppingBag size={21} className="text-[#17320f]" /></div>
        <div><p className="text-[17px] font-extrabold tracking-[-.04em] text-[#17320f]">Atlas Admin</p><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#87906e]">Control center</p></div>
      </div>
      <nav className="flex-1 pb-5">{sections.map((section) => <SidebarMenu key={section.title} title={section.title}>{section.items.map(({ title, href, icon: Icon }) => <SidebarItem key={href} title={title} href={href} icon={<Icon size={16} />} isActive={pathname === href} onClick={onNavigate} />)}</SidebarMenu>)}</nav>
      <div className="rounded-2xl border border-[#dfe4bd] bg-white/70 p-2">
        <div className="mb-1 flex items-center gap-2.5 px-2 py-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-lime-500 text-xs font-bold text-white">{admin?.name?.[0]?.toUpperCase() || "A"}</span><div className="min-w-0"><p className="truncate text-xs font-bold text-[#17320f]">{admin?.name || "Administrator"}</p><p className="truncate text-[10px] text-[#858c75]">{admin?.email || "admin@atlas.com"}</p></div></div>
        <SidebarItem title="Sign out" href="/" icon={<LogOut size={16} />} onClick={onNavigate} />
      </div>
    </div>
  );
}
