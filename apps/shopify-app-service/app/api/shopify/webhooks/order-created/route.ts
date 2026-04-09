import { NextRequest, NextResponse } from "next/server"

import {
    createWebhookSignature,
    processOrderCreatedWebhook,
} from "@/lib/shopify-sim/runtime"

export async function POST(request: NextRequest) {
    const rawBody = await request.text()
    const signature = request.headers.get("X-Shopify-Hmac-Sha256")
    const shop = request.headers.get("X-Shopify-Shop-Domain")
    const expectedSignature = createWebhookSignature(rawBody)

    if (!shop || !signature || signature !== expectedSignature) {
        return NextResponse.json({ error: "Webhook verification failed." }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as {
        id: string
        name: string
        totalPrice: string
        createdAt: string
    }

    const metrics = processOrderCreatedWebhook(shop, payload)

    return NextResponse.json({ ok: true, metrics })
}
