import { NextResponse } from "next/server"

import { getEvents } from "@/lib/shopify-sim/runtime"

export async function GET() {
    return NextResponse.json(getEvents())
}