"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

type StorefrontResponse = {
    shop: string
    extension: {
        title: string
        body: string
        cta: string
    }
}

export default function StorefrontPage() {
    const searchParams = useSearchParams()
    const shop = searchParams.get("shop") || "atlas-demo.myshopify.com"
    const [payload, setPayload] = useState<StorefrontResponse | null>(null)

    useEffect(() => {
        const load = async () => {
            const response = await fetch(`/api/shopify/storefront/extension?shop=${encodeURIComponent(shop)}`, { cache: "no-store" })
            setPayload(await response.json())
        }

        load()
    }, [shop])

    return (
        <div className="shell">
            <div className="container grid" style={{ gap: 24 }}>
                <section className="surface-dark">
                    <div className="eyebrow">Storefront extension</div>
                    <h1 style={{ margin: "14px 0 0", fontSize: 40, letterSpacing: "-0.05em" }}>Theme app extension runtime</h1>
                    <p className="subtitle" style={{ color: "rgba(255,255,255,0.72)" }}>
                        Shopify renders the theme first, then the app injects its block or script, and the storefront logic executes with shop-aware runtime data.
                    </p>
                </section>

                <section className="grid equal">
                    <div className="surface-dark">
                        <p className="miniLabel" style={{ color: "rgba(255,255,255,0.65)" }}>Theme page</p>
                        <h2 style={{ margin: "12px 0 0", fontSize: 42, letterSpacing: "-0.05em" }}>Run app blocks inside the storefront</h2>
                        <p className="subtitle" style={{ color: "rgba(255,255,255,0.72)" }}>
                            The separate app service can still participate in storefront rendering while remaining isolated from website-builder internals.
                        </p>
                    </div>

                    <div className="surface-accent">
                        <div className="eyebrow" style={{ background: "rgba(255,255,255,0.7)", color: "#92400e" }}>Injected app block</div>
                        <h3 style={{ margin: "16px 0 0", fontSize: 28 }}>{payload?.extension.title || "Loading extension..."}</h3>
                        <p className="subtitle" style={{ maxWidth: "unset" }}>{payload?.extension.body || "Waiting for storefront payload."}</p>
                        <button className="button" style={{ marginTop: 18 }}>{payload?.extension.cta || "Open app"}</button>
                    </div>
                </section>

                <section className="card">
                    <h2 className="panelTitle">Execution trace</h2>
                    <div className="list">
                        {[
                            "Store loads page",
                            "Shopify renders theme",
                            "App injects UI block or script",
                            "Frontend logic executes",
                        ].map((step, index) => (
                            <div key={step} className="listItem">
                                <div className="badge">{index + 1}</div>
                                <div>
                                    <strong>{step}</strong>
                                    <div className="note">Shop: {shop}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
