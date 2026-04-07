"use client";
import { WebSocketProvider } from "@/context/web-socket-context";
import useSeller from "@/hooks/useSeller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React, { useState } from "react";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { Toaster } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
          <ProvidersWithWebSocket>
            {children}
          </ProvidersWithWebSocket>
          <Toaster richColors />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { seller, isLoading } = useSeller();

  if (isLoading) return null;

  return (
    <>
        {children}
      {/* {seller && (
        <WebSocketProvider seller={seller}>
        </WebSocketProvider>
      )} */}
      {!seller && children}
    </>
  );
};

export default Providers;
