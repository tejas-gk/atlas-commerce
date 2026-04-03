import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="mt-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-1.5">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
};

export default SidebarMenu;
