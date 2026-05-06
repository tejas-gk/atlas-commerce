"use client";

import React from "react";
import { usePathname } from "next/navigation";

const PageTransitionShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="seller-page-transition">
      {children}
    </div>
  );
};

export default PageTransitionShell;
