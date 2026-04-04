import React from "react";
import SellerSidebar from "@/shared/components/sidebar/sidebar";
import { SellerSiteHeader } from "@/shared/components/header/site-header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex overflow-hidden h-screen bg-[#0d0d0d]">
      <SellerSidebar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <SellerSiteHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
