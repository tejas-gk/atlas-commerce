"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";
import { useAuthStore } from "../store/authStore";
import React from "react";
import { isProtected } from "../utils/protected";

// ── Dev mock (dummy login bypass) ──────────────────────────────────────────
export const DEV_MOCK_SELLER = {
  id: "dev-seller-001",
  name: "Demo Seller",
  email: "demo@atlas.dev",
  activeShopId: "dev-shop-001",
  shop: { id: "dev-shop-001", name: "Demo Store" },
  shops: [{ id: "dev-shop-001", name: "Demo Store" }],
};

// fetch seller data from API
const fetchSeller = async () => {
  if (typeof window !== "undefined" && sessionStorage.getItem("__atlas_dev__")) {
    return DEV_MOCK_SELLER;
  }
  const response = await axiosInstance.get(
    "/auth/api/logged-in-seller",
    isProtected
  );
  return response.data.seller;
};

const useSeller = () => {
  const { setLoggedIn, isLoggedIn } = useAuthStore();
  const queryClient = useQueryClient();

  const {
    data: seller,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: isLoggedIn, // Only run query if seller should be logged in
  });

  // Update auth state based on query results
  React.useEffect(() => {
    if (seller) {
      setLoggedIn(true);
    } else if (isError) {
      setLoggedIn(false);
    }
  }, [seller, isError, setLoggedIn]);

  const switchShopMutation = useMutation({
    mutationFn: async (shopId: string) => {
      const response = await axiosInstance.put(
        "/auth/api/switch-active-shop",
        { shopId },
        isProtected
      );
      return response.data.seller;
    },
    onSuccess: (updatedSeller) => {
      queryClient.setQueryData(["seller"], updatedSeller);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["shop-events"] });
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["seller-domain"] });
      queryClient.invalidateQueries({ queryKey: ["stripe-account"] });
    },
  });

  return {
    seller: seller as any,
    isLoading: isPending,
    isError,
    switchShop: switchShopMutation.mutateAsync,
    isSwitchingShop: switchShopMutation.isPending,
  };
};

export default useSeller;
