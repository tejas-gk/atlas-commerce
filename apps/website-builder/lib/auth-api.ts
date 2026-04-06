"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8080"

export interface SellerAuthRecord {
  id: string
  email: string
  name: string
  activeShopId?: string | null
  shop?: {
    id: string
    name: string
    website?: string | null
  } | null
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || "Request failed")
  }

  return response.json()
}

export const authApi = {
  loginSeller: async (payload: { email: string; password: string }) =>
    request<{ message: string; seller: SellerAuthRecord }>(`/auth/api/login-seller`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getLoggedInSeller: async () =>
    request<{ success: boolean; seller: SellerAuthRecord }>(`/auth/api/logged-in-seller`),
  logoutSeller: async () =>
    request<{ success: boolean }>(`/auth/api/logout-seller`),
}
