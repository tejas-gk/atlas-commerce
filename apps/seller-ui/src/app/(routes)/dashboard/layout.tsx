import React from "react";
import SellerSidebar from "@/shared/components/sidebar/sidebar";
import { SellerSiteHeader } from "@/shared/components/header/site-header";
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <SellerSidebar />
      <SidebarInset>
        <SellerSiteHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-[#0d0d0d] overflow-auto min-h-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
