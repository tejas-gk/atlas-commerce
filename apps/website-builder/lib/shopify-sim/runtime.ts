import "server-only"

import { createHmac, randomUUID } from "node:crypto"
import { EventEmitter } from "node:events"

export const SHOPIFY_SIM_SESSION_COOKIE = "atlas_shopify_sim_session"
export const SHOPIFY_SIM_STATE_COOKIE = "atlas_shopify_sim_state"
export const SHOPIFY_SIM_RETURN_TO_COOKIE = "atlas_shopify_sim_return_to"

const APP_SECRET = process.env.SHOPIFY_SIM_APP_SECRET || "atlas-shopify-sim-secret"

export interface ExampleAppManifest {
    id: string
    name: string
    scopes: string[]
    redirectUri: string
    webhooks: Array<{ topic: string; endpoint: string }>
    adminFeatures: string[]
    storefrontFeatures: string[]
}

export interface InstallRecord {
    shop: string
    appId: string
    accessToken: string
    scopes: string[]
    installedAt: string
}

export interface SessionRecord {
    id: string
    shop: string
    userId: string
    embedded: boolean
    createdAt: string
    expiresAt: string
}

export interface EventRecord {
    id: string
    phase: "install" | "oauth" | "session" | "webhook" | "admin" | "storefront"
    type: string
    shop: string
    status: "pending" | "success" | "error"
    message: string
    createdAt: string
    payload?: Record<string, unknown>
}

export interface OAuthStateRecord {
    state: string
    shop: string
    code: string
    createdAt: string
}

interface ShopMetrics {
    ordersProcessed: number
    apiCalls: number
    storefrontLoads: number
    webhooksDelivered: number
    latestOrders: Array<{
        id: string
        name: string
        totalPrice: string
        createdAt: string
    }>
}

interface ShopifySimState {
    emitter: EventEmitter
    manifest: ExampleAppManifest
    installs: Map<string, InstallRecord>
    sessions: Map<string, SessionRecord>
    oauthStates: Map<string, OAuthStateRecord>
    metrics: Map<string, ShopMetrics>
    events: EventRecord[]
}

declare global {
    var __atlasShopifySimState__: ShopifySimState | undefined
}

function createManifest(): ExampleAppManifest {
    return {
        id: "atlas-flow-ops",
        name: "Atlas Flow Ops",
        scopes: [
            "read_products",
            "read_orders",
            "write_script_tags",
            "write_checkouts",
            "read_customers",
        ],
        redirectUri: "/api/shopify/oauth/callback",
        webhooks: [{ topic: "orders/create", endpoint: "/api/shopify/webhooks/order-created" }],
        adminFeatures: [
            "Embedded iframe app shell",
            "Session-based backend requests",
            "Mock Admin API calls with store context",
        ],
        storefrontFeatures: [
            "Theme app extension block",
            "Storefront banner injection",
            "Runtime personalization payload",
        ],
    }
}

function pushEvent(
    state: ShopifySimState,
    event: Omit<EventRecord, "id" | "createdAt">
) {
    state.events.unshift({
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...event,
    })

    if (state.events.length > 80) {
        state.events.length = 80
    }
}

function getOrCreateMetrics(state: ShopifySimState, shop: string): ShopMetrics {
    const existing = state.metrics.get(shop)
    if (existing) {
        return existing
    }

    const next: ShopMetrics = {
        ordersProcessed: 0,
        apiCalls: 0,
        storefrontLoads: 0,
        webhooksDelivered: 0,
        latestOrders: [],
    }

    state.metrics.set(shop, next)
    return next
}

function createState(): ShopifySimState {
    const state: ShopifySimState = {
        emitter: new EventEmitter(),
        manifest: createManifest(),
        installs: new Map(),
        sessions: new Map(),
        oauthStates: new Map(),
        metrics: new Map(),
        events: [],
    }

    state.emitter.on("shopify.internal.order.created", (payload: { shop: string; order: Record<string, unknown> }) => {
        pushEvent(state, {
            phase: "webhook",
            type: "internal_event_emitted",
            shop: payload.shop,
            status: "success",
            message: `Shopify emitted internal orders/create for ${String(payload.order.name || payload.order.id)}`,
            payload: payload.order,
        })
    })

    state.emitter.on("shopify.webhook.delivered", (payload: { shop: string; orderId: string }) => {
        pushEvent(state, {
            phase: "webhook",
            type: "webhook_delivered",
            shop: payload.shop,
            status: "success",
            message: `Webhook delivered to app endpoint for ${payload.orderId}`,
            payload,
        })
    })

    return state
}

export function getShopifySimState() {
    if (!global.__atlasShopifySimState__) {
        global.__atlasShopifySimState__ = createState()
    }

    return global.__atlasShopifySimState__
}

export function resetShopifySimState() {
    global.__atlasShopifySimState__ = createState()
    return global.__atlasShopifySimState__
}

export function normalizeShop(rawShop?: string | null) {
    if (!rawShop) return null

    const cleaned = rawShop.trim().toLowerCase().replace(/^https?:\/\//, "")
    if (!cleaned) return null

    if (cleaned.endsWith(".myshopify.com")) {
        return cleaned
    }

    return `${cleaned}.myshopify.com`
}

export function createSignedQuery(params: Record<string, string>) {
    const serialized = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&")

    return createHmac("sha256", APP_SECRET).update(serialized).digest("hex")
}

export function verifySignedQuery(params: Record<string, string>, hmac: string) {
    return createSignedQuery(params) === hmac
}

export function createWebhookSignature(rawBody: string) {
    return createHmac("sha256", APP_SECRET).update(rawBody).digest("base64")
}

export function maskToken(token?: string) {
    if (!token) return null
    if (token.length <= 10) return token
    return `${token.slice(0, 6)}...${token.slice(-4)}`
}

export function startOAuth(shop: string) {
    const state = getShopifySimState()
    const oauthState = randomUUID()
    const code = `code_${randomUUID().replace(/-/g, "").slice(0, 14)}`

    state.oauthStates.set(oauthState, {
        state: oauthState,
        shop,
        code,
        createdAt: new Date().toISOString(),
    })

    pushEvent(state, {
        phase: "oauth",
        type: "oauth_handshake_started",
        shop,
        status: "pending",
        message: "Merchant redirected to app server and OAuth handshake started.",
        payload: { state: oauthState, code },
    })

    return { state: oauthState, code }
}

export function completeOAuth(shop: string) {
    const state = getShopifySimState()
    const install: InstallRecord = {
        shop,
        appId: state.manifest.id,
        accessToken: `shpat_${randomUUID().replace(/-/g, "")}`,
        scopes: state.manifest.scopes,
        installedAt: new Date().toISOString(),
    }

    const session: SessionRecord = {
        id: `sess_${randomUUID().replace(/-/g, "")}`,
        shop,
        userId: "merchant_admin_1",
        embedded: true,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    }

    state.installs.set(shop, install)
    state.sessions.set(session.id, session)
    getOrCreateMetrics(state, shop)

    pushEvent(state, {
        phase: "oauth",
        type: "oauth_completed",
        shop,
        status: "success",
        message: "Access token issued and stored per shop.",
        payload: { accessToken: maskToken(install.accessToken), sessionId: session.id },
    })

    pushEvent(state, {
        phase: "session",
        type: "embedded_session_created",
        shop,
        status: "success",
        message: "Embedded app session created for Shopify admin iframe.",
        payload: { sessionId: session.id },
    })

    return { install, session }
}

export function getSession(sessionId?: string | null) {
    if (!sessionId) return null
    return getShopifySimState().sessions.get(sessionId) || null
}

export function getInstall(shop?: string | null) {
    if (!shop) return null
    return getShopifySimState().installs.get(shop) || null
}

export function getSessionSnapshot(sessionId?: string | null, shopHint?: string | null) {
    const state = getShopifySimState()
    const session = getSession(sessionId)
    const shop = session?.shop || normalizeShop(shopHint) || null
    const install = shop ? getInstall(shop) : null
    const metrics = shop ? getOrCreateMetrics(state, shop) : null

    return {
        app: state.manifest,
        session,
        install: install
            ? { ...install, accessToken: maskToken(install.accessToken) }
            : null,
        metrics,
        recentEvents: state.events.slice(0, 20),
    }
}

export function buildAdminContext(shop: string, sessionId?: string | null) {
    const state = getShopifySimState()
    const session = getSession(sessionId)
    const install = getInstall(shop)
    const metrics = getOrCreateMetrics(state, shop)

    pushEvent(state, {
        phase: "admin",
        type: "admin_iframe_loaded",
        shop,
        status: "success",
        message: "Shopify admin loaded the embedded app iframe with shop context.",
        payload: { embedded: true, sessionId: session?.id || null },
    })

    return {
        shop,
        embedded: true,
        session,
        install: install
            ? { ...install, accessToken: maskToken(install.accessToken) }
            : null,
        app: state.manifest,
        metrics,
        uiContext: {
            adminHost: `https://admin.shopify.com/store/${shop.replace(".myshopify.com", "")}`,
            iframeSource: `/shopify/admin-embed?shop=${encodeURIComponent(shop)}`,
        },
    }
}

export function callExampleAdminApi(shop: string, sessionId?: string | null) {
    const state = getShopifySimState()
    const install = getInstall(shop)
    const session = getSession(sessionId)
    const metrics = getOrCreateMetrics(state, shop)

    metrics.apiCalls += 1

    pushEvent(state, {
        phase: "admin",
        type: "backend_called_shopify_api",
        shop,
        status: install ? "success" : "error",
        message: install
            ? "App backend called Shopify Admin APIs using stored access token."
            : "Attempted Admin API call before install completed.",
        payload: { apiCalls: metrics.apiCalls, sessionId: session?.id || null },
    })

    return {
        ok: Boolean(install),
        shop,
        session,
        tokenPreview: maskToken(install?.accessToken),
        data: {
            products: 42,
            ordersToday: metrics.ordersProcessed,
            customers: 128,
            activeDiscounts: 3,
            latestOrders: metrics.latestOrders,
        },
    }
}

export function getEvents() {
    const state = getShopifySimState()
    return {
        app: state.manifest,
        installs: Array.from(state.installs.values()).map((install) => ({
            ...install,
            accessToken: maskToken(install.accessToken),
        })),
        events: state.events.slice(0, 40),
    }
}

export function buildStorefrontExtension(shop: string) {
    const state = getShopifySimState()
    const metrics = getOrCreateMetrics(state, shop)
    metrics.storefrontLoads += 1

    pushEvent(state, {
        phase: "storefront",
        type: "theme_extension_rendered",
        shop,
        status: "success",
        message: "Theme app extension block injected into storefront and frontend logic executed.",
        payload: { storefrontLoads: metrics.storefrontLoads },
    })

    return {
        shop,
        extension: {
            id: "atlas-flow-ops-promotions-banner",
            title: "Atlas Flow Ops Upsell Banner",
            body: "Free shipping unlocked at $75. Backorder Guardian is monitoring incoming inventory in real time.",
            cta: "Open loyalty offers",
        },
        metrics,
    }
}

export function createExampleOrder(shop: string) {
    return {
        id: `gid://shopify/Order/${Date.now()}`,
        name: `#${String(Date.now()).slice(-6)}`,
        totalPrice: (Math.random() * 250 + 25).toFixed(2),
        currencyCode: "USD",
        email: "merchant@example.com",
        shop,
        createdAt: new Date().toISOString(),
        lineItems: [
            { title: "Atlas Signature Hoodie", quantity: 1, price: "89.00" },
            { title: "Ops Sticker Pack", quantity: 2, price: "9.00" },
        ],
    }
}

export async function simulateOrderCreatedWebhook(shop: string, origin: string) {
    const state = getShopifySimState()
    const order = createExampleOrder(shop)
    const payload = JSON.stringify(order)
    const signature = createWebhookSignature(payload)

    state.emitter.emit("shopify.internal.order.created", { shop, order })

    pushEvent(state, {
        phase: "webhook",
        type: "webhook_delivery_started",
        shop,
        status: "pending",
        message: "Webhook delivery system POSTed orders/create to the installed app.",
        payload: { endpoint: "/api/shopify/webhooks/order-created", orderId: order.id },
    })

    const response = await fetch(`${origin}/api/shopify/webhooks/order-created`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Shop-Domain": shop,
            "X-Shopify-Topic": "orders/create",
            "X-Shopify-Hmac-Sha256": signature,
        },
        body: payload,
        cache: "no-store",
    })

    if (response.ok) {
        const metrics = getOrCreateMetrics(state, shop)
        metrics.webhooksDelivered += 1
        state.emitter.emit("shopify.webhook.delivered", { shop, orderId: order.id })
    } else {
        pushEvent(state, {
            phase: "webhook",
            type: "webhook_delivery_failed",
            shop,
            status: "error",
            message: `Webhook endpoint returned ${response.status}.`,
            payload: { orderId: order.id },
        })
    }

    return { order, delivered: response.ok, status: response.status }
}

export function processOrderCreatedWebhook(shop: string, order: { id: string; name: string; totalPrice: string; createdAt: string }) {
    const state = getShopifySimState()
    const metrics = getOrCreateMetrics(state, shop)

    metrics.ordersProcessed += 1
    metrics.latestOrders.unshift({
        id: order.id,
        name: order.name,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
    })

    if (metrics.latestOrders.length > 8) {
        metrics.latestOrders.length = 8
    }

    pushEvent(state, {
        phase: "webhook",
        type: "app_processed_webhook",
        shop,
        status: "success",
        message: `App processed webhook for ${order.name} and updated its backend state.`,
        payload: { orderId: order.id, totalPrice: order.totalPrice },
    })

    return metrics
}