import React from "react";
import SellerSidebar from "@/shared/components/sidebar/sidebar";
import { SellerSiteHeader } from "@/shared/components/header/site-header";
import {
  SidebarProvider,
  SidebarInset,
} from "@workspace/ui/components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <SellerSidebar />
      <SidebarInset className="seller-app-shell overflow-y-auto">
        <SellerSiteHeader />
        <main className="flex flex-1 flex-col px-4 pb-10 pt-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
