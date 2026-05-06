"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createWebsitePayloadFromTemplate } from "@/lib/template-library"
import { authApi } from "@/lib/auth-api"
import { websiteApi, type WebsiteRecord } from "@/lib/website-api"
import { Globe, PlusCircle, Settings, Trash2 } from "lucide-react"

const DEV_MOCK_SELLER = {
  id: "dev-seller-001",
  name: "Demo Seller",
  email: "demo@atlas.dev",
  activeShopId: "dev-shop-001",
  shops: [{ id: "dev-shop-001", name: "Demo Store", isDeleted: false }],
}

function isDemoSession() {
  if (typeof window === "undefined") return false
  return window.sessionStorage.getItem("__atlas_dev__") === "true"
}

function getRelativeDate(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const [websites, setWebsites] = useState<WebsiteRecord[]>([])
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([])
  const [activeShopId, setActiveShopId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadWebsites = async (shopId?: string | null) => {
    if (isDemoSession()) {
      setError(null)
      setWebsites([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await websiteApi.list(shopId || undefined)
      setWebsites(response.websites)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load websites")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchSellerAndWebsites = async () => {
      if (isDemoSession()) {
        setError(null)
        setShops(DEV_MOCK_SELLER.shops.map((shop) => ({ id: shop.id, name: shop.name })))
        setActiveShopId(DEV_MOCK_SELLER.activeShopId)
        setWebsites([])
        setIsLoading(false)
        return
      }

      try {
        const sellerResponse = await authApi.getLoggedInSeller()
        const seller = sellerResponse.seller
        setShops((seller.shops || []).filter((shop) => !shop.isDeleted).map((shop) => ({
          id: shop.id,
          name: shop.name,
        })))
        setActiveShopId(seller.activeShopId ?? null)
        await loadWebsites(seller.activeShopId ?? null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load seller or websites")
        setIsLoading(false)
      }
    }

    fetchSellerAndWebsites()
  }, [])

  const handleCreateWebsite = async () => {
    if (isDemoSession()) {
      const templateKey = searchParams.get("template")
      const nextUrl = templateKey
        ? `/dashboard/builder/new?template=${encodeURIComponent(templateKey)}`
        : "/dashboard/builder/new"
      window.location.href = nextUrl
      return
    }

    try {
      setIsCreating(true)
      const templateKey = searchParams.get("template") || undefined
      const response = await websiteApi.create(
        createWebsitePayloadFromTemplate(
          shops.find((shop) => shop.id === activeShopId)?.name || "Your Shop",
          templateKey
        ),
        activeShopId ?? undefined
      )
      window.location.href = `/dashboard/builder/${response.website.id}`
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create website")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteWebsite = async (websiteId: string) => {
    if (isDemoSession()) {
      setWebsites((current) => current.filter((website) => website.id !== websiteId))
      return
    }

    try {
      await websiteApi.remove(websiteId, undefined, activeShopId ?? undefined)
      setWebsites((current) => current.filter((website) => website.id !== websiteId))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to archive website")
    }
  }

  const handleSwitchShop = async (shopId: string) => {
    if (isDemoSession()) {
      setError(null)
      setActiveShopId(shopId)
      await loadWebsites(shopId)
      return
    }

    try {
      setError(null)
      setActiveShopId(shopId)
      await authApi.switchActiveShop(shopId)
      await loadWebsites(shopId)
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : "Failed to switch shop")
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="font-bold text-xl">Penderghast Website Builder</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link href="/dashboard" className="text-sm font-medium">
            Dashboard
          </Link>
          <Link
            href="/dashboard/templates"
            className="text-sm font-medium text-muted-foreground"
          >
            Templates
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Seller Workspace
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Shop Websites</h1>
            <p className="text-sm text-muted-foreground">
              Build and publish custom ecommerce storefronts for your active shop.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[220px] items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Shop</span>
              <select
                value={activeShopId ?? ""}
                onChange={(event) => handleSwitchShop(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleCreateWebsite} disabled={isCreating || !activeShopId}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {isCreating ? "Creating..." : "New Website"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-8 text-sm text-muted-foreground">Loading websites...</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {websites.map((website) => {
              const primaryDomain = website.domains.find((domain) => domain.isPrimary)

              return (
                <Card key={website.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <img
                      src={website.previewImage || "/placeholder.svg"}
                      alt={website.name}
                      className="aspect-video w-full object-cover"
                    />
                  </CardHeader>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle>{website.name}</CardTitle>
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {website.status}
                      </span>
                    </div>
                    <CardDescription>
                      Updated {getRelativeDate(website.updatedAt)}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5" />
                      <span>
                        {primaryDomain
                          ? `${primaryDomain.domain} (${primaryDomain.status})`
                          : "No custom domain connected"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between p-4 pt-0">
                    <Link href={`/dashboard/builder/${website.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteWebsite(website.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}

            <Card className="flex h-full flex-col items-center justify-center p-6 text-center">
              <PlusCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <CardTitle className="text-xl">Create New Website</CardTitle>
              <CardDescription className="mt-2">
                Start with an ecommerce-ready storefront and connect your own domain.
              </CardDescription>
              <Button className="mt-4" onClick={handleCreateWebsite} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Storefront"}
              </Button>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
