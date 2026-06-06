"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "sonner";
import useUser from "../hooks/useUser";
import { WebSocketProvider } from "@/context/web-socket-context";
import { StoreProvider } from "@/context/cart-context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <ProvidersWithWebSocket>
          {children}
        </ProvidersWithWebSocket>
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
};


const ProvidersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <>
      {user && <WebSocketProvider user={user}>{children}</WebSocketProvider>}
      {!user && children}
    </>
  );
};


export default Providers;
