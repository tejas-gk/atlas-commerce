"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface StorefrontExtensionResponse {
    shop: string
    extension: {
        id: string
        title: string
        body: string
        cta: string
    }
}

export default function ShopifyStorefrontDemoPage() {
    const searchParams = useSearchParams()
    const shop = searchParams.get("shop") || "demo-store.myshopify.com"
    const [payload, setPayload] = useState<StorefrontExtensionResponse | null>(null)

    useEffect(() => {
        const load = async () => {
            const response = await fetch(`/api/shopify/storefront/extension?shop=${encodeURIComponent(shop)}`, {
                cache: "no-store",
            })

            setPayload(await response.json())
        }

        load()
    }, [shop])

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] p-6 text-slate-900">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="rounded-[2rem] border border-slate-200 bg-white/80 px-6 py-5 shadow-xl backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-700">Theme App Extension Demo</p>
                    <h1 className="mt-2 text-3xl font-semibold">Storefront Runtime</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600">
                        This page simulates Shopify rendering the theme and your app injecting a UI block that runs storefront logic after the page loads.
                    </p>
                </header>

                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
                        <div className="rounded-[1.5rem] bg-slate-950 px-6 py-12 text-white">
                            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Theme section</p>
                            <h2 className="mt-4 text-4xl font-semibold">Run app blocks inside the storefront</h2>
                            <p className="mt-3 max-w-xl text-sm text-slate-300">
                                The Shopify theme loads first, then the app extension injects its UI block or script, and finally your runtime logic executes with live store context.
                            </p>
                        </div>

                        <Card className="overflow-hidden rounded-[1.5rem] border-amber-200 bg-amber-50 shadow-none">
                            <CardContent className="space-y-3 p-6">
                                <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Injected app block</p>
                                <h3 className="text-2xl font-semibold">{payload?.extension.title || "Loading extension..."}</h3>
                                <p className="text-sm text-slate-700">{payload?.extension.body || "Waiting for extension payload."}</p>
                                <Button className="bg-slate-950 hover:bg-slate-800">{payload?.extension.cta || "Open app"}</Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Execution trace</p>
                        <div className="mt-4 space-y-3 text-sm">
                            {[
                                "Store loads page",
                                "Shopify renders theme",
                                "App injects UI block/script",
                                "Frontend logic executes",
                            ].map((step, index) => (
                                <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{step}</p>
                                        <p className="mt-1 text-slate-600">Shop: {shop}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}