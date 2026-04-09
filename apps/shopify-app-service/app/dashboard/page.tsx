"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

type SessionResponse = {
    app: {
        id: string
        name: string
        scopes: string[]
    }
    session: { id: string; shop: string } | null
    install: { shop: string; accessToken: string | null; installedAt: string } | null
    metrics: {
        ordersProcessed: number
        apiCalls: number
        storefrontLoads: number
        webhooksDelivered: number
    } | null
}

type BackendResponse = {
    ok: boolean
    tokenPreview: string | null
    data: {
        products: number
        ordersToday: number
        customers: number
        activeDiscounts: number
        latestOrders?: Array<{ id: string; name: string; totalPrice: string }>
    }
}

type EventItem = {
    id: string
    phase: string
    type: string
    shop: string
    status: string
    message: string
    createdAt: string
}

const WEBSITE_BUILDER_URL = process.env.NEXT_PUBLIC_WEBSITE_BUILDER_URL || "http://localhost:3004"
const SELLER_UI_URL = process.env.NEXT_PUBLIC_SELLER_UI_URL || "http://localhost:3000"

export default function ShopifyServiceDashboardPage() {
    const searchParams = useSearchParams()
    const [shop, setShop] = useState(searchParams.get("shop") || "atlas-demo.myshopify.com")
    const [snapshot, setSnapshot] = useState<SessionResponse | null>(null)
    const [backend, setBackend] = useState<BackendResponse | null>(null)
    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(false)

    const activeShop = useMemo(() => snapshot?.install?.shop || shop, [shop, snapshot?.install?.shop])

    const refreshAll = async (targetShop = shop) => {
        const encoded = encodeURIComponent(targetShop)
        const [sessionResponse, backendResponse, eventsResponse] = await Promise.all([
            fetch(`/api/shopify/session?shop=${encoded}`, { cache: "no-store" }),
            fetch(`/api/shopify/example-app?shop=${encoded}`, { cache: "no-store" }),
            fetch(`/api/shopify/events`, { cache: "no-store" }),
        ])

        setSnapshot(await sessionResponse.json())
        setBackend(await backendResponse.json())
        setEvents((await eventsResponse.json()).events)
    }

    useEffect(() => {
        refreshAll(shop)
    }, [shop])

    useEffect(() => {
        if (searchParams.get("installed") === "1" && searchParams.get("shop")) {
            refreshAll(searchParams.get("shop") || shop)
        }
    }, [searchParams, shop])

    const installApp = () => {
        window.location.href = `/api/shopify/install?shop=${encodeURIComponent(shop)}&returnTo=${encodeURIComponent("/dashboard")}`
    }

    const simulateWebhook = async () => {
        setLoading(true)
        await fetch(`/api/shopify/simulate/order-created`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shop: activeShop }),
        })
        await refreshAll(activeShop)
        setLoading(false)
    }

    const resetRuntime = async () => {
        setLoading(true)
        await fetch(`/api/shopify/reset`, { method: "POST" })
        await refreshAll(shop)
        setLoading(false)
    }

    return (
        <div className="shell">
            <div className="container grid" style={{ gap: 24 }}>
                <section className="hero">
                    <div className="headerBar">
                        <div>
                            <div className="eyebrow">Standalone app service</div>
                            <h1 className="title">Atlas Shopify App Service</h1>
                            <p className="subtitle">
                                This runs as its own service outside website-builder. Website-builder and seller-ui can link to it, embed it, or launch flows from it, while OAuth, session handling, event emission, webhook delivery, and storefront extension behavior stay isolated here.
                            </p>
                        </div>
                        <div className="row">
                            <Link className="button-secondary" href={WEBSITE_BUILDER_URL} target="_blank">Website Builder</Link>
                            <Link className="button-secondary" href={SELLER_UI_URL} target="_blank">Seller UI</Link>
                        </div>
                    </div>
                    <div className="toolbar">
                        <input className="input" value={shop} onChange={(event) => setShop(event.target.value)} />
                        <button className="button" onClick={installApp}>Install App</button>
                        <button className="button-secondary" onClick={() => refreshAll(activeShop)} disabled={loading}>Refresh</button>
                        <button className="button-ghost" onClick={resetRuntime} disabled={loading}>Reset</button>
                    </div>
                </section>

                <section className="grid stats">
                    {[
                        ["Installed shops", snapshot?.install ? 1 : 0],
                        ["Embedded sessions", snapshot?.session ? 1 : 0],
                        ["Webhook deliveries", snapshot?.metrics?.webhooksDelivered ?? 0],
                        ["Admin API calls", snapshot?.metrics?.apiCalls ?? 0],
                        ["Storefront loads", snapshot?.metrics?.storefrontLoads ?? 0],
                    ].map(([label, value]) => (
                        <div key={String(label)} className="card stat">
                            <div>
                                <div className="statLabel">{label}</div>
                                <div className="statValue">{value}</div>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="grid two">
                    <div className="card">
                        <h2 className="panelTitle">Install and session flow</h2>
                        <p className="panelDescription">Merchant clicks Install App, Shopify redirects to the app server, OAuth completes, access token is stored per store, and an embedded session is created.</p>
                        <div className="list">
                            {[
                                "Merchant clicks Install App",
                                "Shopify redirects to app server",
                                "OAuth handshake verifies signed callback",
                                "Access token issued and stored per store",
                                "Embedded iframe session established",
                            ].map((step, index) => (
                                <div key={step} className="listItem">
                                    <div className="badge">{index + 1}</div>
                                    <div>{step}</div>
                                </div>
                            ))}
                        </div>
                        <div className="sep" />
                        <div className="row">
                            <div className="miniCard" style={{ flex: 1 }}>
                                <div className="miniLabel">Installed shop</div>
                                <div className="note">{snapshot?.install?.shop || "Not installed yet"}</div>
                            </div>
                            <div className="miniCard" style={{ flex: 1 }}>
                                <div className="miniLabel">Token preview</div>
                                <div className="note" style={{ fontFamily: "monospace" }}>{snapshot?.install?.accessToken || "No token"}</div>
                            </div>
                            <div className="miniCard" style={{ flex: 1 }}>
                                <div className="miniLabel">Session</div>
                                <div className="note" style={{ fontFamily: "monospace" }}>{snapshot?.session?.id || "No session"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="panelTitle">Example app backend</h2>
                        <p className="panelDescription">The embedded frontend calls the backend, and the backend uses the stored store token to hit mocked Shopify Admin APIs.</p>
                        <div className="grid four" style={{ marginTop: 18 }}>
                            {[
                                ["Products", backend?.data.products ?? 0],
                                ["Customers", backend?.data.customers ?? 0],
                                ["Orders today", backend?.data.ordersToday ?? 0],
                                ["Discounts", backend?.data.activeDiscounts ?? 0],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="miniCard">
                                    <div className="miniLabel">{label}</div>
                                    <div className="miniValue">{value}</div>
                                </div>
                            ))}
                        </div>
                        <div className="sep" />
                        <div className="sectionHeader">
                            <div>
                                <h3 style={{ margin: 0 }}>Webhook simulation</h3>
                                <p className="note">Emit an internal order-created event, deliver a webhook POST, and process it inside the app backend.</p>
                            </div>
                            <button className="button" onClick={simulateWebhook} disabled={loading || !snapshot?.install}>Simulate Order Event</button>
                        </div>
                        <div className="list">
                            {(backend?.data.latestOrders || []).map((order) => (
                                <div key={order.id} className="listItem" style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <strong>{order.name}</strong>
                                    <span>${order.totalPrice}</span>
                                </div>
                            ))}
                            {!(backend?.data.latestOrders || []).length && (
                                <div className="listItem">No processed orders yet.</div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid equal">
                    <div className="card">
                        <div className="sectionHeader">
                            <div>
                                <h2 className="panelTitle">Embedded admin surface</h2>
                                <p className="panelDescription">This can be opened directly, or embedded inside website-builder or seller-ui.</p>
                            </div>
                            <Link className="button-secondary" href={`/embedded?shop=${encodeURIComponent(activeShop)}`} target="_blank">Open standalone</Link>
                        </div>
                        <div className="frame">
                            <iframe title="embedded admin" src={`/embedded?shop=${encodeURIComponent(activeShop)}`} className="embedArea" />
                        </div>
                    </div>

                    <div className="card">
                        <div className="sectionHeader">
                            <div>
                                <h2 className="panelTitle">Storefront extension surface</h2>
                                <p className="panelDescription">This simulates theme load, app block injection, and frontend runtime execution.</p>
                            </div>
                            <Link className="button-secondary" href={`/storefront?shop=${encodeURIComponent(activeShop)}`} target="_blank">Open standalone</Link>
                        </div>
                        <div className="frame">
                            <iframe title="storefront extension" src={`/storefront?shop=${encodeURIComponent(activeShop)}`} className="embedArea" />
                        </div>
                    </div>
                </section>

                <section className="card">
                    <div className="sectionHeader">
                        <div>
                            <h2 className="panelTitle">Event emitter and webhook timeline</h2>
                            <p className="panelDescription">Internal emitter events, OAuth lifecycle, admin loads, backend calls, webhook delivery, and storefront execution are all recorded here.</p>
                        </div>
                        <div className="badge">{events.length} events</div>
                    </div>
                    <div className="timeline">
                        {events.map((event) => (
                            <div key={event.id} className="timelineItem">
                                <div className="sectionHeader" style={{ marginBottom: 0 }}>
                                    <div>
                                        <strong>{event.message}</strong>
                                    </div>
                                    <div className={`badge status-${event.status}`}>{event.status}</div>
                                </div>
                                <div className="timelineMeta">
                                    <span>{event.phase}</span>
                                    <span>{event.type}</span>
                                    <span>{event.shop}</span>
                                    <span>{new Date(event.createdAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))}
                        {!events.length && <div className="timelineItem">No events yet.</div>}
                    </div>
                </section>
            </div>
        </div>
    )
}
