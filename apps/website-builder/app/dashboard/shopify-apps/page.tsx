"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppWindow, ExternalLink, Globe2, ShieldCheck, Workflow } from "lucide-react"

const SHOPIFY_APP_SERVICE_URL = process.env.NEXT_PUBLIC_SHOPIFY_APP_SERVICE_URL || "http://localhost:3005"

export default function ShopifyAppsWorkflowPage() {
    const [shop, setShop] = useState("atlas-demo.myshopify.com")
    const serviceDashboardUrl = useMemo(
        () => `${SHOPIFY_APP_SERVICE_URL}/dashboard?shop=${encodeURIComponent(shop)}`,
        [shop]
    )

    return (
        <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.2),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="rounded-4xl border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50">
                                Separate Service
                            </Badge>
                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                                Shopify-style app platform now runs outside website-builder
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm text-slate-600">
                                The install flow, OAuth verification, session handling, event emitter, webhook delivery, admin iframe runtime, and storefront extension logic now live in the standalone monorepo app service. This page acts as a bridge so you can still launch it from website-builder.
                            </p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                            <Input value={shop} onChange={(event) => setShop(event.target.value)} className="min-w-60 bg-white" />
                            <Link href={serviceDashboardUrl} target="_blank">
                                <Button className="w-full bg-slate-950 hover:bg-slate-800">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Service
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            icon: Workflow,
                            title: "Install + OAuth",
                            description: "Merchant install redirects and signed OAuth callback validation happen in the dedicated service.",
                        },
                        {
                            icon: ShieldCheck,
                            title: "Session Runtime",
                            description: "Per-store token storage and embedded admin sessions stay isolated from builder state.",
                        },
                        {
                            icon: AppWindow,
                            title: "Admin Embed",
                            description: "The service exposes its own embedded app surface that can be opened from builder or seller UI.",
                        },
                        {
                            icon: Globe2,
                            title: "Storefront Blocks",
                            description: "Theme extension and storefront injection previews run as part of the same external service.",
                        },
                    ].map(({ icon: Icon, title, description }) => (
                        <Card key={title} className="rounded-[1.75rem] border-white/50 bg-white/70 shadow-xl backdrop-blur">
                            <CardContent className="p-5">
                                <div className="mb-4 inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
                                <p className="mt-2 text-sm text-slate-600">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="rounded-4xl border-white/50 bg-white/70 shadow-xl backdrop-blur">
                    <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle>Embedded standalone service</CardTitle>
                            <CardDescription>
                                This is the dedicated Shopify app platform running in its own Next service at {SHOPIFY_APP_SERVICE_URL}. You can open it full-screen or keep using it from inside website-builder.
                            </CardDescription>
                        </div>
                        <Link href={serviceDashboardUrl} target="_blank">
                            <Button variant="outline">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Full Window
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-inner">
                            <iframe
                                title="Atlas Shopify App Service"
                                src={serviceDashboardUrl}
                                className="h-180 w-full rounded-[1.2rem] border-0 bg-white"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}