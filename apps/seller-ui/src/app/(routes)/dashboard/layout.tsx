import React from "react";
import SellerSidebar from "@/shared/components/sidebar/sidebar";
import { SellerSiteHeader } from "@/shared/components/header/site-header";
import { SidebarProvider, SidebarInset } from "@workspace/ui/components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <SellerSidebar />
      <SidebarInset className="seller-app-shell">
        <SellerSiteHeader />
        <main className="flex flex-1 flex-col px-4 pb-8 pt-5 md:px-6 md:pb-10">
          <div className="mx-auto w-full max-w-[1480px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
