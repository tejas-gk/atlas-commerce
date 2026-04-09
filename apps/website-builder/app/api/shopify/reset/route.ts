import { NextResponse } from "next/server"

import { resetShopifySimState } from "@/lib/shopify-sim/runtime"

export async function POST() {
    const state = resetShopifySimState()
    return NextResponse.json({ ok: true, app: state.manifest })
}