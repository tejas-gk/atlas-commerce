"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppWindow, ExternalLink, ShieldCheck, Webhook, Workflow } from "lucide-react";

const SHOPIFY_APP_SERVICE_URL = process.env.NEXT_PUBLIC_SHOPIFY_APP_SERVICE_URL || "http://localhost:3005";

export default function AppPlatformPage() {
    const [shop, setShop] = useState("atlas-demo.myshopify.com");
    const serviceUrl = useMemo(
        () => `${SHOPIFY_APP_SERVICE_URL}/dashboard?shop=${encodeURIComponent(shop)}`,
        [shop]
    );

    return (
        <div className="space-y-6">
            <section className="seller-panel overflow-hidden rounded-[34px] p-6 md:p-7">
                <div className="seller-page-header">
                    <div className="max-w-3xl space-y-3">
                        <span className="seller-pill inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Separate app service
                        </span>
                        <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-[#17320f]">
                            Shopify-style app platform for seller surfaces
                        </h1>
                        <p className="max-w-2xl text-sm leading-6 text-[#586445]">
                            This is a standalone service in the monorepo. Seller UI can launch it, embed it, or route merchants into it while OAuth, sessions, event emission, webhooks, and storefront extension behavior remain isolated from seller-ui internals.
                        </p>
                    </div>
                    <div className="seller-soft-panel rounded-[24px] px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b7f59]">Service endpoint</p>
                        <p className="mt-2 text-sm font-semibold text-[#17320f]">{SHOPIFY_APP_SERVICE_URL}</p>
                        <p className="mt-1 text-sm text-[#606c49]">Use this from seller flows, custom login experiences, or website-builder bridges.</p>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { title: "OAuth verification", description: "Signed callback validation and token issuance per store.", icon: ShieldCheck },
                    { title: "Embedded admin", description: "Dedicated iframe app runtime for merchant admin screens.", icon: AppWindow },
                    { title: "Webhook engine", description: "Event emitter plus webhook POST delivery into the app backend.", icon: Webhook },
                    { title: "Composable flows", description: "Launch from seller pages or website-builder without moving backend logic.", icon: Workflow },
                ].map(({ title, description, icon: Icon }) => (
                    <article key={title} className="seller-kpi-card rounded-[28px] p-5">
                        <div className="mb-4 inline-flex rounded-[18px] bg-[#1f3b16] p-3 text-white">
                            <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-base font-bold text-[#17320f]">{title}</p>
                        <p className="mt-2 text-sm text-[#687257]">{description}</p>
                    </article>
                ))}
            </section>

            <section className="seller-panel rounded-[30px] p-5">
                <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-bold tracking-[-0.03em] text-foreground">Embedded service dashboard</h2>
                        <p className="text-sm text-muted-foreground">
                            Keep the service separate, but usable from inside the seller workspace.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            value={shop}
                            onChange={(event) => setShop(event.target.value)}
                            className="rounded-2xl border border-[#d8dbbb] bg-white px-4 py-3 text-sm outline-none"
                        />
                        <Link href={serviceUrl} target="_blank" className="rounded-2xl bg-[#1f3b16] px-4 py-3 text-sm font-semibold text-white">
                            <span className="inline-flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Open Service
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-[#d8dbbb] bg-white shadow-[0_18px_34px_rgba(31,59,22,0.08)]">
                    <iframe
                        title="Atlas Shopify App Service"
                        src={serviceUrl}
                        className="h-[820px] w-full border-0 bg-white"
                    />
                </div>
            </section>
        </div>
    );
}