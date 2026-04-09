"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8080"

export interface ProductImageRecord {
  id?: string
  url: string
  file_id?: string
}

export interface ProductRecord {
  id: string
  title: string
  slug: string
  short_description?: string | null
  detailed_description?: string | null
  regular_price?: number | null
  sale_price?: number | null
  stock?: number | null
  category?: string | null
  subCategory?: string | null
  isDeleted?: boolean
  images?: ProductImageRecord[]
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

export const productApi = {
  listShopProducts: async (shopId?: string | null) => {
    const suffix = shopId ? `?shopId=${encodeURIComponent(shopId)}` : ""
    return request<{ success: boolean; products: ProductRecord[] }>(
      `/product/api/get-shop-products${suffix}`
    )
  },
  searchProducts: async (query: string) =>
    request<{ products: ProductRecord[] }>(
      `/product/api/search-products?q=${encodeURIComponent(query)}`
    ),
  getCategories: async () =>
    request<{ categories: string[]; subCategories: string[] }>(
      `/product/api/get-categories`
    ),
  getFilteredProducts: async (params: {
    priceRange?: [number, number]
    categories?: string[]
    colors?: string[]
    sizes?: string[]
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params.priceRange) searchParams.set("priceRange", params.priceRange.join(","))
    if (params.categories?.length) searchParams.set("categories", params.categories.join(","))
    if (params.colors?.length) searchParams.set("colors", params.colors.join(","))
    if (params.sizes?.length) searchParams.set("sizes", params.sizes.join(","))
    searchParams.set("page", String(params.page || 1))
    searchParams.set("limit", String(params.limit || 12))
    return request<{ products: ProductRecord[]; pagination: { total: number; page: number; totalPages: number } }>(
      `/product/api/get-filtered-products?${searchParams.toString()}`
    )
  },
  getRecommendedProducts: async () =>
    request<{ success: boolean; recommendations: ProductRecord[] }>(
      `/recommendation/api/get-recommendation-products`
    ),
}
