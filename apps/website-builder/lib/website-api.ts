"use client"

export interface WebsiteDomainRecord {
  id: string
  domain: string
  status: string
  isPrimary: boolean
  verificationToken: string
  verificationTarget: string
  verificationRecord: string
  verifiedAt?: string | null
  instructions?: {
    type: string
    host: string
    value: string
    token: string
  }
}

export interface WebsiteRecord {
  id: string
  name: string
  slug: string
  description?: string | null
  status: string
  templateKey: string
  isPublished: boolean
  isArchived: boolean
  pages: unknown[]
  theme?: Record<string, unknown> | null
  settings?: Record<string, unknown> | null
  seo?: Record<string, unknown> | null
  previewImage?: string | null
  publishedSnapshot?: unknown
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  domains: WebsiteDomainRecord[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URI || "http://localhost:8080"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || "Request failed")
  }

  return response.json()
}

export const websiteApi = {
  list: async (shopId?: string) => {
    const suffix = shopId ? `?shopId=${encodeURIComponent(shopId)}` : ""
    return request<{ websites: WebsiteRecord[] }>(`/seller/api/websites${suffix}`)
  },
  get: async (websiteId: string, shopId?: string) => {
    const suffix = shopId ? `?shopId=${encodeURIComponent(shopId)}` : ""
    return request<{ website: WebsiteRecord }>(
      `/seller/api/websites/${websiteId}${suffix}`
    )
  },
  create: async (payload: Record<string, unknown>, shopId?: string) =>
    request<{ website: WebsiteRecord }>(`/seller/api/websites`, {
      method: "POST",
      body: JSON.stringify({ ...(shopId ? { shopId } : {}), ...payload }),
    }),
  update: async (websiteId: string, payload: Record<string, unknown>) =>
    request<{ website: WebsiteRecord }>(`/seller/api/websites/${websiteId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  publish: async (websiteId: string, payload: Record<string, unknown>) =>
    request<{ website: WebsiteRecord }>(
      `/seller/api/websites/${websiteId}/publish`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
  remove: async (websiteId: string, payload?: Record<string, unknown>) =>
    request<{ message: string }>(`/seller/api/websites/${websiteId}`, {
      method: "DELETE",
      body: JSON.stringify(payload || {}),
    }),
  addDomain: async (websiteId: string, payload: Record<string, unknown>) =>
    request<{ domain: WebsiteDomainRecord }>(
      `/seller/api/websites/${websiteId}/domains`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
  connectDomain: async (
    websiteId: string,
    domainId: string,
    payload?: Record<string, unknown>
  ) =>
    request<{ domain: WebsiteDomainRecord }>(
      `/seller/api/websites/${websiteId}/domains/${domainId}/connect`,
      {
        method: "PATCH",
        body: JSON.stringify(payload || {}),
      }
    ),
  deleteDomain: async (
    websiteId: string,
    domainId: string,
    payload?: Record<string, unknown>
  ) =>
    request<{ message: string }>(
      `/seller/api/websites/${websiteId}/domains/${domainId}`,
      {
        method: "DELETE",
        body: JSON.stringify(payload || {}),
      }
    ),
}
