import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import {
    SHOPIFY_SIM_RETURN_TO_COOKIE,
    SHOPIFY_SIM_SESSION_COOKIE,
    SHOPIFY_SIM_STATE_COOKIE,
    completeOAuth,
    normalizeShop,
    verifySignedQuery,
} from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const shop = normalizeShop(searchParams.get("shop"))
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const timestamp = searchParams.get("timestamp")
    const embedded = searchParams.get("embedded")
    const hmac = searchParams.get("hmac")

    if (!shop || !code || !state || !timestamp || !embedded || !hmac) {
        return NextResponse.json({ error: "Missing OAuth callback params." }, { status: 400 })
    }

    const cookieStore = await cookies()
    const expectedState = cookieStore.get(SHOPIFY_SIM_STATE_COOKIE)?.value
    const returnTo = cookieStore.get(SHOPIFY_SIM_RETURN_TO_COOKIE)?.value || "/dashboard"
    const isValid = verifySignedQuery({ shop, code, state, timestamp, embedded }, hmac)

    if (!isValid || expectedState !== state) {
        return NextResponse.json({ error: "OAuth verification failed." }, { status: 401 })
    }

    const { session } = completeOAuth(shop)
    cookieStore.set(SHOPIFY_SIM_SESSION_COOKIE, session.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: new Date(session.expiresAt),
    })

    const redirectUrl = new URL(returnTo, request.nextUrl.origin)
    redirectUrl.searchParams.set("installed", "1")
    redirectUrl.searchParams.set("shop", shop)

    return NextResponse.redirect(redirectUrl)
}
