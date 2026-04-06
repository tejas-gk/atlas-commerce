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
        <main className="flex flex-1 flex-col gap-4 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
