"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type AdminContext = {
    shop: string
    session: { id: string } | null
    metrics: {
        ordersProcessed: number
        apiCalls: number
        storefrontLoads: number
        webhooksDelivered: number
    }
}

type BackendResponse = {
    tokenPreview: string | null
    data: {
        products: number
        customers: number
        ordersToday: number
        activeDiscounts: number
    }
}

export default function EmbeddedPage() {
    const searchParams = useSearchParams()
    const shop = searchParams.get("shop") || "atlas-demo.myshopify.com"
    const [context, setContext] = useState<AdminContext | null>(null)
    const [backend, setBackend] = useState<BackendResponse | null>(null)

    useEffect(() => {
        const load = async () => {
            const [contextResponse, backendResponse] = await Promise.all([
                fetch(`/api/shopify/admin/context?shop=${encodeURIComponent(shop)}`, { cache: "no-store" }),
                fetch(`/api/shopify/example-app?shop=${encodeURIComponent(shop)}`, { cache: "no-store" }),
            ])

            setContext(await contextResponse.json())
            setBackend(await backendResponse.json())
        }

        load()
    }, [shop])

    return (
        <div className="shell" style={{ padding: 16, background: "#020617" }}>
            <div className="container grid" style={{ gap: 16 }}>
                <section className="surface-dark">
                    <div className="sectionHeader">
                        <div>
                            <div className="eyebrow">Embedded admin iframe</div>
                            <h1 style={{ margin: "14px 0 0", fontSize: 34, letterSpacing: "-0.04em" }}>Atlas Flow Ops</h1>
                            <p className="subtitle" style={{ color: "rgba(255,255,255,0.72)" }}>
                                Shopify loads this app in an iframe, passes the store context, and the backend reuses the per-store token for Admin API calls.
                            </p>
                        </div>
                        <div className="badge">{shop}</div>
                    </div>
                </section>

                <section className="grid stats">
                    {[
                        ["Orders processed", context?.metrics.ordersProcessed ?? 0],
                        ["Admin API calls", context?.metrics.apiCalls ?? 0],
                        ["Webhook deliveries", context?.metrics.webhooksDelivered ?? 0],
                        ["Storefront loads", context?.metrics.storefrontLoads ?? 0],
                    ].map(([label, value]) => (
                        <div key={String(label)} className="surface" style={{ background: "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.12)" }}>
                            <div className="statLabel" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</div>
                            <div className="statValue">{value}</div>
                        </div>
                    ))}
                </section>

                <section className="grid equal">
                    <div className="surface" style={{ background: "rgba(255,255,255,0.06)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}>
                        <h2 className="panelTitle">Session context</h2>
                        <p className="note" style={{ color: "rgba(255,255,255,0.68)" }}>Session and token state are managed by the service backend, not by website-builder or seller-ui.</p>
                        <div className="list">
                            <div className="listItem" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                                <strong>Session ID</strong>
                                <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 12 }}>{context?.session?.id || "No session"}</span>
                            </div>
                            <div className="listItem" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                                <strong>Token preview</strong>
                                <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 12 }}>{backend?.tokenPreview || "No token"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="surface" style={{ background: "rgba(255,255,255,0.06)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}>
                        <h2 className="panelTitle">Backend results</h2>
                        <div className="grid four" style={{ marginTop: 16 }}>
                            {[
                                ["Products", backend?.data.products ?? 0],
                                ["Customers", backend?.data.customers ?? 0],
                                ["Orders", backend?.data.ordersToday ?? 0],
                                ["Discounts", backend?.data.activeDiscounts ?? 0],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="miniCard" style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "white" }}>
                                    <div className="miniLabel" style={{ color: "rgba(255,255,255,0.65)" }}>{label}</div>
                                    <div className="miniValue">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
