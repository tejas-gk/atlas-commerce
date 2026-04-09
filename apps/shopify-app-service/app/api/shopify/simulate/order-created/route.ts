import { NextRequest, NextResponse } from "next/server"

import { normalizeShop, simulateOrderCreatedWebhook } from "@/lib/shopify-sim/runtime"

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({} as { shop?: string }))
    const shop = normalizeShop(body.shop || request.nextUrl.searchParams.get("shop"))

    if (!shop) {
        return NextResponse.json({ error: "A shop is required." }, { status: 400 })
    }

    const result = await simulateOrderCreatedWebhook(shop, request.nextUrl.origin)
    return NextResponse.json(result)
}
