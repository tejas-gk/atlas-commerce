"use client";
import React from "react";
import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;