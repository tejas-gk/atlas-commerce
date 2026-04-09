import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import {
    SHOPIFY_SIM_RETURN_TO_COOKIE,
    SHOPIFY_SIM_STATE_COOKIE,
    createSignedQuery,
    normalizeShop,
    startOAuth,
} from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const shop = normalizeShop(request.nextUrl.searchParams.get("shop"))
    const returnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard"

    if (!shop) {
        return NextResponse.json({ error: "Invalid shop." }, { status: 400 })
    }

    const { state, code } = startOAuth(shop)
    const params = {
        shop,
        code,
        state,
        timestamp: String(Date.now()),
        embedded: "1",
    }
    const hmac = createSignedQuery(params)

    const cookieStore = await cookies()
    cookieStore.set(SHOPIFY_SIM_STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", path: "/" })
    cookieStore.set(SHOPIFY_SIM_RETURN_TO_COOKIE, returnTo, { httpOnly: true, sameSite: "lax", path: "/" })

    const callbackUrl = new URL("/api/shopify/oauth/callback", request.nextUrl.origin)
    Object.entries(params).forEach(([key, value]) => callbackUrl.searchParams.set(key, value))
    callbackUrl.searchParams.set("hmac", hmac)

    return NextResponse.redirect(callbackUrl)
}
