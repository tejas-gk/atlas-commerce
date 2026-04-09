import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

import { SHOPIFY_SIM_SESSION_COOKIE, getSessionSnapshot } from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SHOPIFY_SIM_SESSION_COOKIE)?.value || null
    const shop = request.nextUrl.searchParams.get("shop")

    return NextResponse.json(getSessionSnapshot(sessionId, shop))
}