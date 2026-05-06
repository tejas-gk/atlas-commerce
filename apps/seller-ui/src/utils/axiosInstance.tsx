import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const isDemoSession = () => {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem("__atlas_dev__") === "true";
};

const getDemoFallbackData = (url: string) => {
  if (url.includes("/order/api/get-seller-orders")) {
    return { orders: [] };
  }
  if (url.includes("/order/api/get-payment-summary")) {
    return {
      totalEarnings: 0,
      totalAdminFees: 0,
      pendingPayments: 0,
      completedPayments: 0,
    };
  }
  if (url.includes("/product/api/get-shop-products")) {
    return { products: [] };
  }
  if (url.includes("/product/api/get-discount-codes")) {
    return { discountCodes: [] };
  }
  if (url.includes("/product/api/get-categories")) {
    return { categories: [] };
  }
  if (url.includes("/seller/api/seller-notifications")) {
    return { notifications: [] };
  }

  return null;
};

// Handle logout and prevent infinite loops
const handleLogout = () => {
  if (isDemoSession()) return;
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  if (!publicPaths.includes(currentPath)) {
    runRedirectToLogin();
  }
};

// Handle adding a new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

// Execute queued requests after refresh
const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Handle API requests
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Handle expired tokens and refresh logic
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const is401 = error?.response?.status === 401;
    const statusCode = error?.response?.status;
    const isRetry = originalRequest?._retry;
    const isRefreshRequest = originalRequest?.url?.includes(
      "/auth/api/refresh-token"
    );
    const isAuthRequired = originalRequest?.requireAuth !== false;
    const requestMethod = (originalRequest?.method ?? "get").toLowerCase();
    const requestUrl = originalRequest?.url ?? "";

    // Demo sessions do not have backend cookies; reject 401s without forcing logout.
    if (is401 && isDemoSession()) {
      return Promise.reject(error);
    }

    // Demo mode should stay navigable even when optional backend services return 500.
    if (isDemoSession() && statusCode >= 500 && requestMethod === "get") {
      const fallbackData = getDemoFallbackData(requestUrl) ?? {};

      return Promise.resolve({
        data: fallbackData,
        status: 200,
        statusText: "OK",
        headers: error?.response?.headers ?? {},
        config: originalRequest,
      });
    }

    // prevent infinite retry loop
    if (is401 && !isRetry && isAuthRequired && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await axios.post(
          `http://localhost:8080/auth/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;
        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (error) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
