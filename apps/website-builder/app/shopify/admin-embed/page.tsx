"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Activity, Boxes, DatabaseZap, ShieldCheck } from "lucide-react"

interface AdminContextResponse {
    shop: string
    embedded: boolean
    session: { id: string } | null
    metrics: {
        ordersProcessed: number
        apiCalls: number
        storefrontLoads: number
        webhooksDelivered: number
    }
}

interface ExampleAppResponse {
    ok: boolean
    tokenPreview: string | null
    data: {
        products: number
        ordersToday: number
        customers: number
        activeDiscounts: number
    }
}

export default function ShopifyAdminEmbedPage() {
    const searchParams = useSearchParams()
    const shop = searchParams.get("shop") || "demo-store.myshopify.com"
    const [context, setContext] = useState<AdminContextResponse | null>(null)
    const [backendData, setBackendData] = useState<ExampleAppResponse | null>(null)

    useEffect(() => {
        const load = async () => {
            const [contextResponse, backendResponse] = await Promise.all([
                fetch(`/api/shopify/admin/context?shop=${encodeURIComponent(shop)}`, { cache: "no-store" }),
                fetch(`/api/shopify/example-app?shop=${encodeURIComponent(shop)}`, { cache: "no-store" }),
            ])

            setContext(await contextResponse.json())
            setBackendData(await backendResponse.json())
        }

        load()
    }, [shop])

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-slate-50">
            <div className="mx-auto max-w-5xl space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Embedded Shopify Admin</p>
                        <h1 className="text-xl font-semibold">Atlas Flow Ops</h1>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/20">{shop}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { label: "Orders processed", value: context?.metrics.ordersProcessed ?? 0, icon: Activity },
                        { label: "Admin API calls", value: context?.metrics.apiCalls ?? 0, icon: DatabaseZap },
                        { label: "Webhook deliveries", value: context?.metrics.webhooksDelivered ?? 0, icon: ShieldCheck },
                        { label: "Storefront loads", value: context?.metrics.storefrontLoads ?? 0, icon: Boxes },
                    ].map(({ label, value, icon: Icon }) => (
                        <Card key={label} className="border-white/10 bg-white/5 text-slate-50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="rounded-xl bg-white/10 p-2"><Icon className="h-4 w-4" /></div>
                                <div>
                                    <p className="text-xs text-slate-300">{label}</p>
                                    <p className="text-xl font-semibold">{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-white/10 bg-white/5 text-slate-50">
                        <CardHeader>
                            <CardTitle>Embedded app shell</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-300">
                            <p>
                                Shopify admin loads this page inside an iframe, passes the store context, and the app backend reuses the installed store token for Admin API calls.
                            </p>
                            <Separator className="bg-white/10" />
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</p>
                                    <p className="mt-2 font-mono text-xs text-cyan-200">{context?.session?.id || "No embedded session yet"}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Token preview</p>
                                    <p className="mt-2 font-mono text-xs text-cyan-200">{backendData?.tokenPreview || "Install required"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-white/5 text-slate-50">
                        <CardHeader>
                            <CardTitle>Backend app call</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-300">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs text-slate-400">Products</p>
                                    <p className="mt-1 text-2xl font-semibold">{backendData?.data.products ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs text-slate-400">Customers</p>
                                    <p className="mt-1 text-2xl font-semibold">{backendData?.data.customers ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs text-slate-400">Orders today</p>
                                    <p className="mt-1 text-2xl font-semibold">{backendData?.data.ordersToday ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-xs text-slate-400">Active discounts</p>
                                    <p className="mt-1 text-2xl font-semibold">{backendData?.data.activeDiscounts ?? 0}</p>
                                </div>
                            </div>
                            <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">Embedded actions available</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}