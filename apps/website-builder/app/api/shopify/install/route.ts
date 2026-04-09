import { NextRequest, NextResponse } from "next/server"

import { normalizeShop } from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const shop = normalizeShop(request.nextUrl.searchParams.get("shop"))
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard/shopify-apps"

    if (!shop) {
        return NextResponse.json({ error: "A shop is required." }, { status: 400 })
    }

    const redirectUrl = new URL("/api/shopify/oauth/authorize", request.nextUrl.origin)
    redirectUrl.searchParams.set("shop", shop)
    redirectUrl.searchParams.set("returnTo", returnTo)

    return NextResponse.redirect(redirectUrl)
}