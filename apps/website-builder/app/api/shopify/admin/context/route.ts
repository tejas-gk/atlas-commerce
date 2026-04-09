import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import {
    SHOPIFY_SIM_SESSION_COOKIE,
    buildAdminContext,
    normalizeShop,
} from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const shop = normalizeShop(request.nextUrl.searchParams.get("shop"))
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SHOPIFY_SIM_SESSION_COOKIE)?.value || null

    if (!shop) {
        return NextResponse.json({ error: "A shop is required." }, { status: 400 })
    }

    return NextResponse.json(buildAdminContext(shop, sessionId))
}