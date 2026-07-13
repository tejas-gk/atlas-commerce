import Link from "next/link";
import React from "react";

export default function SidebarItem({ icon, title, isActive, href, onClick }: { title: string; icon: React.ReactNode; isActive?: boolean; href: string; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className={`group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-all ${isActive ? "bg-[#17320f] text-white shadow-[0_10px_24px_rgba(23,50,15,.16)]" : "text-[#687259] hover:bg-white hover:text-[#17320f]"}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-lg transition ${isActive ? "bg-white/12 text-lime-300" : "text-[#7c8669] group-hover:bg-lime-100 group-hover:text-lime-700"}`}>{icon}</span>
      <span>{title}</span>
      {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime-400" />}
    </Link>
  );
}
