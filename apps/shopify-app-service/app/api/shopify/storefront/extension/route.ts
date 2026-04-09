import { NextRequest, NextResponse } from "next/server"

import { buildStorefrontExtension, normalizeShop } from "@/lib/shopify-sim/runtime"

export async function GET(request: NextRequest) {
    const shop = normalizeShop(request.nextUrl.searchParams.get("shop"))

    if (!shop) {
        return NextResponse.json({ error: "A shop is required." }, { status: 400 })
    }

    return NextResponse.json(buildStorefrontExtension(shop))
}
