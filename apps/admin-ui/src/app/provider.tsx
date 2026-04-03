"use client";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState } from "react";

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
      <TooltipProvider>

        {/* Added next-themes provider to enforce Mochi dark mode */}
        <NextThemesProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem={false}
        >
         {children}
        </NextThemesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Providers;