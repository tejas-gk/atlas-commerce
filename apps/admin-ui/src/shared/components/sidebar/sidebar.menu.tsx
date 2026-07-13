import React from "react";
export default function SidebarMenu({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-5"><h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#989d7d]">{title}</h3><div className="space-y-1">{children}</div></section>;
}
