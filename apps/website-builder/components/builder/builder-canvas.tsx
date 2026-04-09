"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
    BuilderElement,
    BuilderSection,
    DragData,
} from "../../lib/builder-types"
import type { ProductRecord } from "../../lib/product-api"
import { productApi } from "../../lib/product-api"
import { DRAG_TYPE_KEY, createNewElement } from "../../lib/builder-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    GripVertical,
    Plus,
    ChevronDown,
    ChevronUp,
    Trash2,
    Copy,
    Columns3,
    MousePointerClick,
    Search,
    SlidersHorizontal,
    Sparkles,
    LogIn,
    AlertCircle,
    Info,
    Flag,
    ChevronsUpDown as ChevronsUpDownIcon,
} from "lucide-react"

// ───── Drop Indicator Line ─────
function DropLine() {
    return (
        <div className="relative h-1 my-0.5 z-20">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-blue-500 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-500 border-2 border-background" />
        </div>
    )
}

function getProductImage(product?: ProductRecord | null) {
    return product?.images?.[0]?.url || "/placeholder.svg?height=240&width=320"
}

function getElementMedia(element: BuilderElement, fallback?: string) {
    return element.mediaItems?.filter(Boolean) || (fallback ? [fallback] : [])
}

function formatPrice(product?: ProductRecord | null, fallback?: string) {
    if (typeof product?.sale_price === "number") return `$${product.sale_price.toFixed(2)}`
    if (typeof product?.regular_price === "number") return `$${product.regular_price.toFixed(2)}`
    if (fallback) return `$${fallback}`
    return "Add pricing"
}

function getLinkedProduct(element: BuilderElement, shopProducts: ProductRecord[]) {
    if (!shopProducts.length) return null
    if (element.productId) {
        return shopProducts.find((product) => product.id === element.productId) || null
    }
    return shopProducts[0] || null
}

function SearchBarPreview({
    element,
    baseStyles,
    showPreview,
}: {
    element: BuilderElement
    baseStyles: React.CSSProperties
    showPreview: boolean
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<ProductRecord[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [navigated, setNavigated] = useState<string | null>(null)

    useEffect(() => {
        const trimmed = query.trim()
        if (trimmed.length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true)
                const response = await productApi.searchProducts(trimmed)
                setResults(response.products || [])
            } catch {
                setResults([])
            } finally {
                setIsSearching(false)
            }
        }, 250)

        return () => clearTimeout(timer)
    }, [query])

    const handleSearch = () => {
        const q = query.trim()
        if (!q) return
        const route = (element.href || "/products?query={query}").replace("{query}", encodeURIComponent(q))
        if (showPreview) {
            window.open(route, "_blank")
        } else {
            setNavigated(route)
        }
    }

    return (
        <div className="space-y-3">
            <div
                id={element.htmlId || undefined}
                className={`${element.cssClasses} flex items-center gap-3 rounded-full`}
                style={baseStyles}
            >
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => { if (event.key === "Enter") handleSearch() }}
                    placeholder={element.content || "Search products"}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                    onClick={handleSearch}
                    className="ml-auto rounded-full bg-foreground px-3 py-1 text-xs text-background hover:bg-foreground/80 transition-colors"
                >
                    Search
                </button>
            </div>
            {navigated && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                    ↗ Would navigate to: <span className="font-medium">{navigated}</span>
                    <button className="ml-2 underline" onClick={() => setNavigated(null)}>dismiss</button>
                </div>
            )}
            <div className="text-[11px] text-muted-foreground">
                Route: <span className="font-medium text-foreground">{element.href || "/products?query={query}"}</span>
                {showPreview && <span className="ml-1 text-blue-600">(Enter = opens in new tab)</span>}
            </div>
            {(query.trim().length >= 2 || results.length > 0) && (
                <div className="rounded-2xl border bg-background p-3 shadow-sm">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                        {isSearching ? "Searching..." : `${results.length} result${results.length === 1 ? "" : "s"}`}
                    </div>
                    <div className="space-y-2">
                        {results.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 rounded-xl border p-2">
                                <img
                                    src={getProductImage(product)}
                                    alt={product.title}
                                    className="h-12 w-12 rounded-lg object-cover"
                                    crossOrigin="anonymous"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium text-foreground">
                                        {product.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatPrice(product)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {!isSearching && results.length === 0 && (
                            <div className="text-sm text-muted-foreground">
                                No products matched your search.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function RecommendationsPreview({
    element,
    baseStyles,
    shopProducts,
}: {
    element: BuilderElement
    baseStyles: React.CSSProperties
    shopProducts: ProductRecord[]
}) {
    const [products, setProducts] = useState<ProductRecord[]>(shopProducts.slice(0, Math.max(1, element.productLimit || 4)))

    useEffect(() => {
        let isMounted = true

        const loadRecommendations = async () => {
            try {
                const response = await productApi.getRecommendedProducts()
                if (isMounted && response.recommendations?.length) {
                    setProducts(response.recommendations.slice(0, Math.max(1, element.productLimit || 4)))
                    return
                }
            } catch {
                // Fall back to shop products for unauthenticated preview states.
            }

            if (isMounted) {
                setProducts(shopProducts.slice(0, Math.max(1, element.productLimit || 4)))
            }
        }

        loadRecommendations()

        return () => {
            isMounted = false
        }
    }, [element.productLimit, shopProducts])

    return (
        <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-4`} style={baseStyles}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-2xl font-semibold text-foreground">
                        {element.content || "Recommended for you"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Personalized picks from the recommendation service, with a shop-product fallback.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart shelf
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {(products.length ? products : shopProducts.slice(0, 4)).map((product) => (
                    <div key={product.id} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                        <img
                            src={getProductImage(product)}
                            alt={product.title}
                            className="h-48 w-full object-cover"
                            crossOrigin="anonymous"
                        />
                        <div className="space-y-2 p-4">
                            <h4 className="text-base font-semibold text-foreground">{product.title}</h4>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                {product.short_description || "Recommendations appear here for returning shoppers."}
                            </p>
                            <span className="text-sm font-semibold text-foreground">{formatPrice(product)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProductFiltersPreview({
    element,
    baseStyles,
    shopProducts,
}: {
    element: BuilderElement
    baseStyles: React.CSSProperties
    shopProducts: ProductRecord[]
}) {
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [priceCap, setPriceCap] = useState<number>(999999)

    useEffect(() => {
        let isMounted = true
        productApi
            .getCategories()
            .then((response) => {
                if (isMounted) setCategories(response.categories || [])
            })
            .catch(() => {
                if (isMounted) {
                    setCategories(
                        Array.from(new Set(shopProducts.map((product) => product.category).filter(Boolean) as string[]))
                    )
                }
            })
        return () => {
            isMounted = false
        }
    }, [shopProducts])

    const filteredProducts = shopProducts
        .filter((product) => selectedCategory === "all" || product.category === selectedCategory)
        .filter((product) => {
            const price = typeof product.sale_price === "number" ? product.sale_price : product.regular_price || 0
            return price <= priceCap
        })
        .slice(0, Math.max(1, element.productLimit || 8))

    return (
        <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-4`} style={baseStyles}>
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-2xl font-semibold text-foreground">
                        {element.content || "Browse Products"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Interactive category and price filters, similar to the main `web` storefront flow.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters live
                </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="space-y-4 rounded-2xl border bg-background p-4 shadow-sm">
                    <div>
                        <div className="mb-2 text-sm font-semibold text-foreground">Category</div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory("all")}
                                className={`rounded-full px-3 py-1 text-xs ${selectedCategory === "all" ? "bg-foreground text-background" : "bg-muted text-foreground"}`}
                            >
                                All
                            </button>
                            {categories.slice(0, 8).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-full px-3 py-1 text-xs ${selectedCategory === category ? "bg-foreground text-background" : "bg-muted text-foreground"}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-sm font-semibold text-foreground">Max Price</div>
                        <input
                            type="range"
                            min={0}
                            max={5000}
                            step={50}
                            value={Math.min(priceCap, 5000)}
                            onChange={(event) => setPriceCap(Number(event.target.value))}
                            className="w-full"
                        />
                        <div className="mt-2 text-xs text-muted-foreground">Up to ${Math.min(priceCap, 5000)}</div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {(filteredProducts.length ? filteredProducts : shopProducts.slice(0, 6)).map((product) => (
                        <div key={product.id} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                            <img
                                src={getProductImage(product)}
                                alt={product.title}
                                className="h-44 w-full object-cover"
                                crossOrigin="anonymous"
                            />
                            <div className="space-y-2 p-4">
                                <h4 className="text-base font-semibold text-foreground">{product.title}</h4>
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {product.short_description || "Filtered catalog items appear here."}
                                </p>
                                <span className="text-sm font-semibold text-foreground">{formatPrice(product)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function OAuthLoginPreview({
    element,
    baseStyles,
}: {
    element: BuilderElement
    baseStyles: React.CSSProperties
}) {
    return (
        <div className="inline-flex flex-col gap-2">
            <button
                id={element.htmlId || undefined}
                className={`${element.cssClasses} inline-flex items-center gap-3`}
                style={baseStyles}
                onClick={(event) => event.preventDefault()}
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                        <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                        <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                        <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                    </svg>
                </span>
                <span className="text-sm font-medium text-foreground">{element.content || "Continue with Google"}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700">
                    <LogIn className="h-3 w-3" />
                    OAuth ready
                </span>
            </button>
            <div className="text-[11px] text-muted-foreground">
                Route: <span className="font-medium text-foreground">{element.href || "/login"}</span>
            </div>
        </div>
    )
}

// ───── Element Renderer ─────
function RenderElement({
    element,
    isEditing,
    shopProducts,
    showPreview,
    onInlineEdit,
}: {
    element: BuilderElement
    isEditing: boolean
    shopProducts: ProductRecord[]
    showPreview: boolean
    onInlineEdit: (id: string, content: string) => void
}) {
    const baseStyles: React.CSSProperties = {
        color: element.styles.color,
        backgroundColor:
            element.styles.backgroundColor !== "transparent"
                ? element.styles.backgroundColor
                : undefined,
        fontSize: element.styles.fontSize,
        fontWeight: element.styles.fontWeight,
        fontStyle: element.styles.fontStyle as React.CSSProperties["fontStyle"],
        textDecoration: element.styles.textDecoration,
        textAlign: element.styles.alignment as React.CSSProperties["textAlign"],
        marginTop: `${element.styles.margin.top}px`,
        marginRight:
            element.styles.margin.right === "auto"
                ? "auto"
                : `${element.styles.margin.right}px`,
        marginBottom: `${element.styles.margin.bottom}px`,
        marginLeft:
            element.styles.margin.left === "auto"
                ? "auto"
                : `${element.styles.margin.left}px`,
        paddingTop: `${element.styles.padding.top}px`,
        paddingRight: `${element.styles.padding.right}px`,
        paddingBottom: `${element.styles.padding.bottom}px`,
        paddingLeft: `${element.styles.padding.left}px`,
        width: element.styles.width !== "auto" ? element.styles.width : undefined,
        height: element.styles.height || undefined,
        borderRadius: element.styles.borderRadius || undefined,
        border: element.styles.border || undefined,
        boxShadow: element.styles.boxShadow || undefined,
        opacity: element.styles.opacity !== undefined ? element.styles.opacity : undefined,
        backgroundImage: element.styles.backgroundImage
            ? `url(${element.styles.backgroundImage})`
            : undefined,
        backgroundSize: element.styles.backgroundImage ? "cover" : undefined,
        backgroundPosition: element.styles.backgroundImage ? "center" : undefined,
    }

    if (
        isEditing &&
        (element.type === "heading" ||
            element.type === "paragraph" ||
            element.type === "button" ||
            element.type === "quote" ||
            element.type === "badge-element")
    ) {
        return (
            <input
                autoFocus
                className="w-full bg-blue-50 border-2 border-blue-400 rounded px-2 py-1 outline-none font-sans"
                style={{
                    ...baseStyles,
                    backgroundColor: undefined,
                }}
                defaultValue={element.content}
                onBlur={(e) => onInlineEdit(element.id, e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onInlineEdit(element.id, (e.target as HTMLInputElement).value)
                    }
                }}
            />
        )
    }

    switch (element.type) {
        case "heading":
            return (
                <h2
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} select-none`}
                    style={baseStyles}
                >
                    {element.content}
                </h2>
            )
        case "paragraph":
            return (
                <p
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} select-none leading-relaxed`}
                    style={baseStyles}
                >
                    {element.content}
                </p>
            )
        case "button":
            return (
                <button
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} inline-flex items-center justify-center rounded-md select-none cursor-default`}
                    style={baseStyles}
                    onClick={(e) => e.preventDefault()}
                >
                    {element.content}
                </button>
            )
        case "search-bar":
            return <SearchBarPreview element={element} baseStyles={baseStyles} showPreview={showPreview} />
        case "oauth-login":
            return <OAuthLoginPreview element={element} baseStyles={baseStyles} />
        case "image":
            const imageMedia = getElementMedia(element, element.content || "/placeholder.svg?height=200&width=400")
            return (
                <div className="space-y-2">
                    <img
                        src={imageMedia[0] || "/placeholder.svg?height=200&width=400"}
                        id={element.htmlId || undefined}
                        className={`${element.cssClasses} max-w-full rounded`}
                        style={baseStyles}
                        alt="Builder image"
                        crossOrigin="anonymous"
                    />
                    {element.href && (
                        <div className="text-[11px] text-muted-foreground">
                            Route: <span className="font-medium text-foreground">{element.href}</span>
                        </div>
                    )}
                </div>
            )
        case "hero-slider": {
            const mediaItems = getElementMedia(element)
            const slides = (element.content || "")
                .split("\n")
                .map((line) => line.split("|"))
                .map(([title, subtitle, image]) => ({
                    title: title || "Hero headline",
                    subtitle: subtitle || "Add a compelling message for your storefront.",
                    image: image || mediaItems[0] || "/placeholder.svg?height=420&width=1200",
                }))
                .filter((slide) => slide.title || slide.subtitle)
            const activeSlide = slides[0] || {
                title: "Showcase your best-selling products",
                subtitle: "Use rotating slides for launches, offers, and category highlights.",
                image: "/placeholder.svg?height=420&width=1200",
            }

            return (
                <div
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} relative overflow-hidden`}
                    style={{
                        ...baseStyles,
                        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.82), rgba(17,24,39,0.56)), url(${activeSlide.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <div className="flex h-full min-h-[320px] flex-col justify-between">
                        <div className="max-w-2xl space-y-4">
                            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                                Featured Story
                            </span>
                            <h2 className="text-4xl font-semibold leading-tight text-white">
                                {activeSlide.title}
                            </h2>
                            <p className="max-w-xl text-base text-white/78">
                                {activeSlide.subtitle}
                            </p>
                        </div>
                        <div className="flex items-center justify-between pt-8">
                            <div className="flex gap-2">
                                {slides.slice(0, 4).map((slide, index) => (
                                    <span
                                        key={`${slide.title}-${index}`}
                                        className={`h-2.5 rounded-full ${index === 0 ? "w-8 bg-white" : "w-2.5 bg-white/35"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-white/75">
                                {Math.max(slides.length, mediaItems.length || slides.length)} slide{Math.max(slides.length, mediaItems.length || slides.length) === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        case "product-card":
            const linkedProduct = element.dataSource !== "manual" ? getLinkedProduct(element, shopProducts) : null
            const productMedia = getElementMedia(element, element.styles.backgroundImage || "/placeholder.svg?height=200&width=400")
            return (
                <div
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} max-w-xs rounded-lg border select-none`}
                    style={baseStyles}
                >
                    <img
                        src={linkedProduct ? getProductImage(linkedProduct) : productMedia[0]}
                        className="w-full h-40 object-cover rounded-tl-lg rounded-tr-lg"
                        alt={linkedProduct?.title || "Product"}
                        crossOrigin="anonymous"
                    />
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">
                            {linkedProduct?.title || element.content || "Product Name"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {linkedProduct?.short_description || formatPrice(linkedProduct, element.styles.price)}
                        </p>
                        {productMedia.length > 1 && !linkedProduct && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                                Carousel media: {productMedia.length} images
                            </p>
                        )}
                        {element.href && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                                Route: <span className="font-medium text-foreground">{element.href}</span>
                            </p>
                        )}
                        <button className="mt-4 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium cursor-default">Add to Cart</button>
                    </div>
                </div>
            )
        case "product-grid": {
            const products =
                element.dataSource === "manual"
                    ? []
                    : shopProducts.slice(0, Math.max(1, element.productLimit || 4))

            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-4`} style={baseStyles}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-2xl font-semibold text-foreground">
                                {element.content || "Featured Products"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {products.length
                                    ? `Showing ${products.length} product${products.length === 1 ? "" : "s"} from the active shop`
                                    : "Add products in the seller dashboard to populate this grid automatically."}
                            </p>
                        </div>
                        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            Auto sync
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {(products.length ? products : Array.from({ length: 4 }).map((_, index) => ({
                            id: `placeholder-${index}`,
                            title: `Product ${index + 1}`,
                            short_description: "Product details will appear here once your catalog is connected.",
                            images: [{ url: "/placeholder.svg?height=240&width=320" }],
                        } as ProductRecord))).map((product) => (
                            <div key={product.id} className="overflow-hidden rounded-2xl border bg-background shadow-sm">
                                <img
                                    src={getProductImage(product)}
                                    alt={product.title}
                                    className="h-48 w-full object-cover"
                                    crossOrigin="anonymous"
                                />
                                <div className="space-y-2 p-4">
                                    <h4 className="text-base font-semibold text-foreground">{product.title}</h4>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {product.short_description || "Describe the product, materials, or key benefits."}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-sm font-semibold text-foreground">
                                            {formatPrice(product)}
                                        </span>
                                        <button className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background">
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
        case "recommended-products":
            return (
                <RecommendationsPreview
                    element={element}
                    baseStyles={baseStyles}
                    shopProducts={shopProducts}
                />
            )
        case "product-filters":
            return (
                <ProductFiltersPreview
                    element={element}
                    baseStyles={baseStyles}
                    shopProducts={shopProducts}
                />
            )
        case "video":
            return (
                <div style={baseStyles} className="aspect-video w-full">
                    <iframe
                        src={element.content}
                        className="w-full h-full rounded"
                        allowFullScreen
                        title="Embedded video"
                    />
                </div>
            )
        case "navigation":
            return (
                <nav
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} flex gap-4 select-none`}
                    style={baseStyles}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                />
            )
        case "list":
            return (
                <ul
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} list-disc pl-5 select-none`}
                    style={baseStyles}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                />
            )
        case "divider":
            return (
                <hr
                    className="border-border"
                    style={{
                        marginTop: `${element.styles.margin.top}px`,
                        marginBottom: `${element.styles.margin.bottom}px`,
                    }}
                />
            )
        case "spacer":
            return (
                <div
                    className="bg-muted/30 border border-dashed border-muted-foreground/20 rounded flex items-center justify-center"
                    style={{ height: element.styles.height || "40px" }}
                >
                    <span className="text-[10px] text-muted-foreground">Spacer</span>
                </div>
            )
        case "custom-code":
            return (
                <div
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} select-none`}
                    style={baseStyles}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                />
            )
        case "quote":
            return (
                <blockquote
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} select-none`}
                    style={{ ...baseStyles, borderLeft: element.styles.border || "3px solid #e5e5e5" }}
                >
                    {element.content}
                </blockquote>
            )
        case "icon": {
            const iconName = element.content || "star"
            const iconMap: Record<string, string> = { star: "\u2605", heart: "\u2665", check: "\u2713", arrow: "\u2192", mail: "\u2709", phone: "\u260E", home: "\u2302", music: "\u266B", sun: "\u2600", moon: "\u263E" }
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} select-none`} style={baseStyles}>
                    {iconMap[iconName] || "\u2605"}
                </div>
            )
        }
        case "social-links": {
            const links = (element.content || "twitter,facebook,instagram").split(",").map(s => s.trim())
            const socialIcons: Record<string, string> = { twitter: "X", facebook: "f", instagram: "IG", linkedin: "in", youtube: "YT", tiktok: "TT", github: "GH", pinterest: "P" }
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} flex gap-3 select-none`} style={baseStyles}>
                    {links.map((name) => (
                        <div key={name} className="h-9 w-9 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold hover:bg-foreground/20 transition-colors cursor-default">
                            {socialIcons[name] || name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
            )
        }
        case "form-input":
            return (
                <div className="space-y-1.5 select-none" style={baseStyles}>
                    {element.label && <label className="text-sm font-medium block">{element.label}</label>}
                    <input
                        type="text"
                        placeholder={element.placeholder || "Enter text..."}
                        className="w-full rounded-md border px-3 py-2 text-sm bg-background cursor-default"
                        style={{ borderColor: "#d1d5db", borderRadius: element.styles.borderRadius }}
                        readOnly
                    />
                </div>
            )
        case "form-textarea":
            return (
                <div className="space-y-1.5 select-none" style={baseStyles}>
                    {element.label && <label className="text-sm font-medium block">{element.label}</label>}
                    <textarea
                        placeholder={element.placeholder || "Enter text..."}
                        className="w-full rounded-md border px-3 py-2 text-sm bg-background cursor-default resize-none"
                        style={{ borderColor: "#d1d5db", borderRadius: element.styles.borderRadius, height: element.styles.height || "80px" }}
                        readOnly
                    />
                </div>
            )
        case "form": {
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-4 select-none`} style={baseStyles}>
                    <h3 className="text-lg font-semibold">{element.content || "Contact Us"}</h3>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium block">Name</label>
                        <input type="text" placeholder="Your name" className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background" readOnly />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium block">Email</label>
                        <input type="email" placeholder="your@email.com" className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background" readOnly />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium block">Message</label>
                        <textarea placeholder="Your message..." className="w-full rounded-md border border-border px-3 py-2 text-sm bg-background resize-none h-20" readOnly />
                    </div>
                    <button className="px-6 py-2 bg-foreground text-background rounded-md text-sm font-medium cursor-default">Send Message</button>
                </div>
            )
        }
        case "table": {
            const rows = (element.content || "").split("\n").map(r => r.split(",").map(c => c.trim()))
            const header = rows[0] || []
            const body = rows.slice(1)
            return (
                <div className="select-none overflow-auto" style={baseStyles}>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b-2 border-border">{header.map((h, i) => <th key={i} className="text-left py-2 px-3 font-semibold">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {body.map((row, ri) => (
                                <tr key={ri} className="border-b border-border hover:bg-muted/30">
                                    {row.map((cell, ci) => <td key={ci} className="py-2 px-3">{cell}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
        case "progress": {
            const value = Math.min(100, Math.max(0, Number(element.content) || 75))
            return (
                <div className="select-none space-y-1" style={{ ...baseStyles, height: undefined }}>
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{value}%</span>
                    </div>
                    <div className="w-full rounded-full overflow-hidden" style={{ height: element.styles.height || "8px", backgroundColor: element.styles.backgroundColor !== "transparent" ? element.styles.backgroundColor : "#e5e5e5" }}>
                        <div className="h-full rounded-full bg-foreground transition-all" style={{ width: `${value}%` }} />
                    </div>
                </div>
            )
        }
        case "badge-element":
            return (
                <span
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} inline-flex items-center select-none cursor-default`}
                    style={baseStyles}
                >
                    {element.content}
                </span>
            )
        case "accordion": {
            const items = (element.content || "").split("\n").map(line => {
                const [q, a] = line.split("|")
                return { question: q || "Question", answer: a || "Answer" }
            })
            return (
                <div className="select-none divide-y" style={baseStyles}>
                    {items.map((item, i) => (
                        <div key={i} className="py-3 px-4">
                            <div className="flex items-center justify-between font-medium text-sm">
                                {item.question}
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5">{item.answer}</p>
                        </div>
                    ))}
                </div>
            )
        }
        case "embed":
            return (
                <div className="select-none" style={baseStyles}>
                    <iframe
                        src={element.content}
                        className="w-full rounded"
                        style={{ height: element.styles.height || "400px" }}
                        title="Embed"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            )
        case "map":
            return (
                <div className="select-none" style={baseStyles}>
                    <iframe
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(element.content || "New York")}&output=embed`}
                        className="w-full rounded"
                        style={{ height: element.styles.height || "300px", borderRadius: element.styles.borderRadius }}
                        title="Map"
                        loading="lazy"
                    />
                </div>
            )
        case "countdown": {
            const target = new Date(element.content || "2026-12-31T00:00:00")
            const now = new Date()
            const diff = Math.max(0, target.getTime() - now.getTime())
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
            const mins = Math.floor((diff / (1000 * 60)) % 60)
            const secs = Math.floor((diff / 1000) % 60)
            return (
                <div className="select-none flex gap-4 justify-center" style={baseStyles}>
                    {[
                        { label: "Days", value: days },
                        { label: "Hours", value: hours },
                        { label: "Minutes", value: mins },
                        { label: "Seconds", value: secs },
                    ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <div className="bg-foreground/5 rounded-lg px-4 py-3 min-w-[60px] text-center" style={{ fontSize: element.styles.fontSize, fontWeight: element.styles.fontWeight }}>
                                {String(value).padStart(2, "0")}
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                        </div>
                    ))}
                </div>
            )
        }
        case "gallery": {
            const images = (element.content || "").split(",").map(s => s.trim()).filter(Boolean)
            return (
                <div className="select-none grid grid-cols-2 gap-2" style={baseStyles}>
                    {images.map((src, i) => (
                        <img
                            key={i}
                            src={src || "/placeholder.svg?height=200&width=200"}
                            className="w-full aspect-square object-cover rounded-lg"
                            alt={`Gallery ${i + 1}`}
                            crossOrigin="anonymous"
                        />
                    ))}
                </div>
            )
        }

        // ───── shadcn/ui Components ─────

        case "card-element": {
            const [title, description, footer] = (element.content || "Card Title||Card Footer").split("|")
            return (
                <Card id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <CardHeader>
                        <CardTitle className="text-base">{title || "Card Title"}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Card content goes here. Add any elements inside this card.</p>
                    </CardContent>
                    {footer && (
                        <CardFooter>
                            <Button size="sm" variant="outline">{footer}</Button>
                        </CardFooter>
                    )}
                </Card>
            )
        }

        case "tabs-element": {
            const tabLines = (element.content || "Tab 1|Content\nTab 2|Content 2").split("\n").map(l => {
                const [label, content] = l.split("|")
                return { label: label?.trim() || "Tab", content: content?.trim() || "" }
            }).filter(t => t.label)
            const defaultTab = tabLines[0]?.label?.toLowerCase().replace(/\s+/g, "-") || "tab-1"
            return (
                <Tabs id={element.htmlId || undefined} defaultValue={defaultTab} className={element.cssClasses} style={baseStyles}>
                    <TabsList>
                        {tabLines.map(t => (
                            <TabsTrigger key={t.label} value={t.label.toLowerCase().replace(/\s+/g, "-")}>
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabLines.map(t => (
                        <TabsContent key={t.label} value={t.label.toLowerCase().replace(/\s+/g, "-")}>
                            <p className="text-sm text-muted-foreground p-2">{t.content || "Tab content goes here."}</p>
                        </TabsContent>
                    ))}
                </Tabs>
            )
        }

        case "avatar-element": {
            const [name, initials, src] = (element.content || "User|U").split("|")
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} flex items-center gap-3`} style={baseStyles}>
                    <Avatar>
                        {src && <AvatarImage src={src} alt={name || "User"} />}
                        <AvatarFallback>{initials || (name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {name && <span className="text-sm font-medium">{name}</span>}
                </div>
            )
        }

        case "alert-element": {
            const [title, description] = (element.content || "Alert|Description").split("|")
            const variant = element.cssClasses?.includes("destructive") ? "destructive" : "default"
            return (
                <Alert id={element.htmlId || undefined} variant={variant} style={baseStyles}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{title || "Alert"}</AlertTitle>
                    {description && <AlertDescription>{description}</AlertDescription>}
                </Alert>
            )
        }

        case "dialog-element": {
            const [trigger, title, description] = (element.content || "Open Dialog|Dialog Title|Dialog content.").split("|")
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">{trigger || "Open Dialog"}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{title || "Dialog Title"}</DialogTitle>
                                {description && <DialogDescription>{description}</DialogDescription>}
                            </DialogHeader>
                            <p className="text-sm text-muted-foreground">Dialog body content goes here. Customize via the content field.</p>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }

        case "popover-element": {
            const [trigger, title, description] = (element.content || "Open Popover|Popover Title|Popover content.").split("|")
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">{trigger || "Open Popover"}</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            {title && <h4 className="mb-1 text-sm font-semibold">{title}</h4>}
                            <p className="text-xs text-muted-foreground">{description || "Popover content."}</p>
                        </PopoverContent>
                    </Popover>
                </div>
            )
        }

        case "collapsible-element": {
            const [trigger, content] = (element.content || "Toggle|Hidden content goes here.").split("|")
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 px-2">
                                {trigger || "Toggle Section"}
                                <ChevronsUpDownIcon className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-2 py-3 text-sm text-muted-foreground border-l-2 border-border ml-2 mt-1">
                            {content || "Hidden content goes here."}
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            )
        }

        case "hover-card-element": {
            const [trigger, title, description] = (element.content || "Hover me|@user|Bio shown on hover.").split("|")
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Button variant="link" className="px-0">{trigger || "Hover me"}</Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>{(title || "U").slice(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{title || "@user"}</p>
                                    <p className="text-xs text-muted-foreground">{description || "Description."}</p>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            )
        }

        case "skeleton-element": {
            const count = Math.max(1, Math.min(6, Number(element.content) || 3))
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-3`} style={baseStyles}>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    {Array.from({ length: count }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            )
        }

        case "select-element": {
            const [placeholder, optionsStr] = (element.content || "Select...|Option 1,Option 2,Option 3").split("|")
            const options = (optionsStr || "Option 1,Option 2,Option 3").split(",").map(o => o.trim()).filter(Boolean)
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-1.5`} style={baseStyles}>
                    {element.label && <Label className="text-sm">{element.label}</Label>}
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder={placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(opt => (
                                <SelectItem key={opt} value={opt.toLowerCase().replace(/\s+/g, "-")}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )
        }

        case "checkbox-element": {
            const [label] = (element.content || "Accept terms and conditions").split("|")
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} flex items-center gap-2`} style={baseStyles}>
                    <Checkbox id={`cb-${element.id}`} />
                    <Label htmlFor={`cb-${element.id}`} className="text-sm cursor-pointer">{label || "Checkbox label"}</Label>
                </div>
            )
        }

        case "switch-element": {
            const [label] = (element.content || "Enable notifications").split("|")
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} flex items-center gap-2`} style={baseStyles}>
                    <Switch id={`sw-${element.id}`} />
                    <Label htmlFor={`sw-${element.id}`} className="text-sm cursor-pointer">{label || "Toggle label"}</Label>
                </div>
            )
        }

        case "slider-element": {
            const [defaultVal, min, max] = (element.content || "50|0|100").split("|")
            const val = Number(defaultVal) || 50
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-3`} style={baseStyles}>
                    {element.label && <Label className="text-sm">{element.label}</Label>}
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{min || 0}</span>
                        <Slider defaultValue={[val]} min={Number(min) || 0} max={Number(max) || 100} step={1} className="flex-1" />
                        <span className="text-xs text-muted-foreground">{max || 100}</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Current: {val}</p>
                </div>
            )
        }

        case "carousel-element": {
            const slides = (element.content || "Slide 1|Content\nSlide 2|Content 2").split("\n").map(l => {
                const [title, content] = l.split("|")
                return { title: title?.trim() || "Slide", content: content?.trim() || "" }
            }).filter(s => s.title)
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} w-full`} style={baseStyles}>
                    <Carousel>
                        <CarouselContent>
                            {slides.map((slide, i) => (
                                <CarouselItem key={i}>
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center p-8 gap-2">
                                            <h3 className="text-lg font-semibold">{slide.title}</h3>
                                            <p className="text-sm text-muted-foreground text-center">{slide.content || "Slide content goes here."}</p>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            )
        }

        case "command-element": {
            const lines = (element.content || "Search...\nHome\nSettings\nProfile").split("\n")
            const placeholder = lines[0] || "Search..."
            const commandItems = lines.slice(1).filter(Boolean)
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} rounded-lg border shadow-sm`} style={baseStyles}>
                    <Command>
                        <CommandInput placeholder={placeholder} />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {commandItems.map(item => (
                                    <CommandItem key={item}>{item}</CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>
            )
        }

        case "radio-group-element": {
            const [defaultVal, optionsStr] = (element.content || "a|Option A,Option B,Option C").split("|")
            const options = (optionsStr || "Option A,Option B,Option C").split(",").map(o => o.trim()).filter(Boolean)
            return (
                <div id={element.htmlId || undefined} className={`${element.cssClasses} space-y-2`} style={baseStyles}>
                    {element.label && <Label className="text-sm font-medium">{element.label}</Label>}
                    <RadioGroup defaultValue={defaultVal || options[0]?.toLowerCase().replace(/\s+/g, "-")}>
                        {options.map(opt => {
                            const val = opt.toLowerCase().replace(/\s+/g, "-")
                            return (
                                <div key={val} className="flex items-center gap-2">
                                    <RadioGroupItem value={val} id={`${element.id}-${val}`} />
                                    <Label htmlFor={`${element.id}-${val}`} className="text-sm cursor-pointer">{opt}</Label>
                                </div>
                            )
                        })}
                    </RadioGroup>
                </div>
            )
        }

        case "breadcrumb-element": {
            const crumbs = (element.content || "Home,Products,Current Page").split(",").map(c => c.trim()).filter(Boolean)
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {crumbs.map((crumb, i) => (
                                <BreadcrumbItem key={i}>
                                    {i < crumbs.length - 1 ? (
                                        <>
                                            <BreadcrumbLink href="#">{crumb}</BreadcrumbLink>
                                            <BreadcrumbSeparator />
                                        </>
                                    ) : (
                                        <BreadcrumbPage>{crumb}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            )
        }

        case "pagination-element": {
            const [currentPage, totalPages] = (element.content || "1|10").split("|").map(Number)
            const current = currentPage || 1
            const total = totalPages || 10
            return (
                <div id={element.htmlId || undefined} className={element.cssClasses} style={baseStyles}>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            {current > 2 && (
                                <PaginationItem>
                                    <PaginationLink href="#">1</PaginationLink>
                                </PaginationItem>
                            )}
                            {current > 3 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            {current > 1 && (
                                <PaginationItem>
                                    <PaginationLink href="#">{current - 1}</PaginationLink>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationLink href="#" isActive>{current}</PaginationLink>
                            </PaginationItem>
                            {current < total && (
                                <PaginationItem>
                                    <PaginationLink href="#">{current + 1}</PaginationLink>
                                </PaginationItem>
                            )}
                            {current < total - 2 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            {current < total - 1 && (
                                <PaginationItem>
                                    <PaginationLink href="#">{total}</PaginationLink>
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )
        }

        case "callout": {
            const [type, title, description] = (element.content || "info|Note|This is a callout message.").split("|")
            const variantMap: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
                info: { bg: "bg-blue-50", border: "border-blue-200", icon: <Info className="h-4 w-4 text-blue-600" /> },
                warning: { bg: "bg-amber-50", border: "border-amber-200", icon: <AlertCircle className="h-4 w-4 text-amber-600" /> },
                error: { bg: "bg-red-50", border: "border-red-200", icon: <AlertCircle className="h-4 w-4 text-red-600" /> },
                success: { bg: "bg-emerald-50", border: "border-emerald-200", icon: <Info className="h-4 w-4 text-emerald-600" /> },
            }
            const v = variantMap[type] || variantMap.info
            return (
                <div
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} flex gap-3 rounded-lg border p-4 ${v.bg} ${v.border}`}
                    style={baseStyles}
                >
                    <span className="mt-0.5 shrink-0">{v.icon}</span>
                    <div>
                        {title && <p className="text-sm font-semibold">{title}</p>}
                        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
                    </div>
                </div>
            )
        }

        case "ribbon": {
            const [label, subtitle] = (element.content || "New|Limited time offer").split("|")
            return (
                <div
                    id={element.htmlId || undefined}
                    className={`${element.cssClasses} relative overflow-hidden rounded-lg`}
                    style={baseStyles}
                >
                    <div className="flex items-center gap-3 rounded-lg border bg-foreground px-4 py-2.5">
                        <Flag className="h-4 w-4 text-background" />
                        <div>
                            <p className="text-sm font-bold text-background">{label || "New"}</p>
                            {subtitle && <p className="text-xs text-background/70">{subtitle}</p>}
                        </div>
                    </div>
                </div>
            )
        }

        default:
            return null
    }
}

// ───── Column Element (with nested drop zones) ─────
function ColumnElement({
    element,
    shopProducts,
    selectedElementId,
    hoveredElementId,
    editingElementId,
    showPreview,
    onSelect,
    onHover,
    onInlineEdit,
    onDoubleClick,
    onDropInColumn,
    onDragStartInColumn,
    onDragEndElement,
    onDeleteElement,
    onDuplicateElement,
    onChangeColumnCount,
}: {
    element: BuilderElement
    shopProducts: ProductRecord[]
    selectedElementId: string | null
    hoveredElementId: string | null
    editingElementId: string | null
    showPreview: boolean
    onSelect: (elementId: string, sectionId: string) => void
    onHover: (id: string | null) => void
    onInlineEdit: (id: string, content: string) => void
    onDoubleClick: (id: string) => void
    onDropInColumn: (
        sectionId: string,
        parentId: string,
        colIndex: number,
        insertIndex: number,
        dragData: DragData
    ) => void
    onDragStartInColumn: (
        e: React.DragEvent,
        elementId: string,
        parentId: string,
        colIndex: number,
        index: number
    ) => void
    onDragEndElement: () => void
    onDeleteElement: (id: string) => void
    onDuplicateElement: (id: string) => void
    onChangeColumnCount: (elementId: string, count: number) => void
}) {
    const cols = element.columnElements || []
    const colCount = element.columnCount || 2
    const [dropTarget, setDropTarget] = useState<{
        colIndex: number
        insertIndex: number
    } | null>(null)

    return (
        <div className="w-full">
            {/* Column count selector */}
            <div className="flex items-center gap-1 mb-2">
                <Columns3 className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">
                    Columns:
                </span>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                        key={n}
                        className={`h-5 w-5 rounded text-[10px] font-medium transition-colors ${colCount === n
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:bg-accent"
                            }`}
                        onClick={(e) => {
                            e.stopPropagation()
                            onChangeColumnCount(element.id, n)
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>

            {/* Column grid */}
            <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
            >
                {Array.from({ length: colCount }).map((_, colIndex) => {
                    const colElements = cols[colIndex] || []
                    return (
                        <div
                            key={colIndex}
                            className={`min-h-[80px] border-2 border-dashed rounded-lg p-2 transition-colors ${dropTarget?.colIndex === colIndex
                                ? "border-blue-400 bg-blue-50/50"
                                : "border-muted-foreground/20 hover:border-muted-foreground/40"
                                }`}
                            onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                e.dataTransfer.dropEffect = "copy"
                                const rect = e.currentTarget.getBoundingClientRect()
                                const y = e.clientY - rect.top
                                const children = e.currentTarget.children
                                let insertIndex = colElements.length
                                for (let i = 0; i < children.length; i++) {
                                    const child = children[i] as HTMLElement
                                    if (child.dataset.dropline === "true") continue
                                    const childRect = child.getBoundingClientRect()
                                    const midY = childRect.top + childRect.height / 2 - rect.top
                                    if (y < midY) {
                                        insertIndex = i
                                        break
                                    }
                                }
                                setDropTarget({ colIndex, insertIndex })
                            }}
                            onDragLeave={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                    setDropTarget(null)
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                try {
                                    const raw = e.dataTransfer.getData(DRAG_TYPE_KEY)
                                    if (!raw) return
                                    const dragData = JSON.parse(raw) as DragData
                                    onDropInColumn(
                                        "",
                                        element.id,
                                        colIndex,
                                        dropTarget?.insertIndex ?? colElements.length,
                                        dragData
                                    )
                                } catch {
                                    // ignore
                                }
                                setDropTarget(null)
                            }}
                        >
                            {colElements.length === 0 && !dropTarget?.colIndex ? (
                                <div className="flex flex-col items-center justify-center h-full gap-1 text-muted-foreground/50">
                                    <Plus className="h-4 w-4" />
                                    <span className="text-[10px]">Drop here</span>
                                </div>
                            ) : null}
                            {colElements.map((child, idx) => (
                                <div key={child.id}>
                                    {dropTarget?.colIndex === colIndex &&
                                        dropTarget.insertIndex === idx && <DropLine />}
                                    <CanvasElement
                                        element={child}
                                        shopProducts={shopProducts}
                                        sectionId=""
                                        index={idx}
                                        selectedElementId={selectedElementId}
                                        hoveredElementId={hoveredElementId}
                                        editingElementId={editingElementId}
                                        showPreview={showPreview}
                                        onSelect={onSelect}
                                        onHover={onHover}
                                        onInlineEdit={onInlineEdit}
                                        onDoubleClick={onDoubleClick}
                                        onDragStart={(e) =>
                                            onDragStartInColumn(
                                                e,
                                                child.id,
                                                element.id,
                                                colIndex,
                                                idx
                                            )
                                        }
                                        onDragEnd={onDragEndElement}
                                        onDeleteElement={onDeleteElement}
                                        onDuplicateElement={onDuplicateElement}
                                    />
                                </div>
                            ))}
                            {dropTarget?.colIndex === colIndex &&
                                dropTarget.insertIndex === colElements.length && <DropLine />}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ───── Single Canvas Element (with selection, hover, drag handle) ─────
function CanvasElement({
    element,
    shopProducts,
    sectionId,
    index,
    selectedElementId,
    hoveredElementId,
    editingElementId,
    showPreview,
    onSelect,
    onHover,
    onInlineEdit,
    onDoubleClick,
    onDragStart,
    onDragEnd,
    onDeleteElement,
    onDuplicateElement,
}: {
    element: BuilderElement
    shopProducts: ProductRecord[]
    sectionId: string
    index: number
    selectedElementId: string | null
    hoveredElementId: string | null
    editingElementId: string | null
    showPreview: boolean
    onSelect: (elementId: string, sectionId: string) => void
    onHover: (id: string | null) => void
    onInlineEdit: (id: string, content: string) => void
    onDoubleClick: (id: string) => void
    onDragStart: (e: React.DragEvent) => void
    onDragEnd: () => void
    onDeleteElement: (id: string) => void
    onDuplicateElement: (id: string) => void
}) {
    const isSelected = element.id === selectedElementId
    const isHovered = element.id === hoveredElementId && !isSelected

    return (
        <div
            className={`relative group transition-all duration-100 rounded ${isSelected
                ? "ring-2 ring-blue-500 ring-offset-2"
                : isHovered
                    ? "ring-1 ring-blue-300 ring-offset-1"
                    : ""
                }`}
            draggable={element.type !== "columns"}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onMouseEnter={() => onHover(element.id)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
                e.stopPropagation()
                onSelect(element.id, sectionId)
            }}
            onDoubleClick={(e) => {
                e.stopPropagation()
                onDoubleClick(element.id)
            }}
        >
            {/* Floating toolbar on select */}
            {isSelected && (
                <div className="absolute -top-8 left-0 z-30 flex items-center gap-0.5 bg-foreground text-background rounded-md px-1 py-0.5 shadow-lg">
                    <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1 font-normal capitalize bg-foreground text-background border-none hover:bg-foreground"
                    >
                        {element.type}
                    </Badge>
                    <div className="w-px h-3 bg-background/30 mx-0.5" />
                    <button
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/20 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateElement(element.id)
                        }}
                        title="Duplicate"
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                    <button
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/80 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteElement(element.id)
                        }}
                        title="Delete"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            )}

            {/* Drag handle */}
            {(isSelected || isHovered) && element.type !== "columns" && (
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex items-center cursor-grab active:cursor-grabbing z-20 opacity-60 hover:opacity-100">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            )}

            {/* Hover type badge (only when not selected, since selected shows toolbar) */}
            {isHovered && !isSelected && (
                <div className="absolute -top-5 left-0 z-20">
                    <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5 font-normal capitalize"
                    >
                        {element.type}
                    </Badge>
                </div>
            )}

            <RenderElement
                element={element}
                isEditing={editingElementId === element.id}
                shopProducts={shopProducts}
                showPreview={showPreview}
                onInlineEdit={onInlineEdit}
            />
        </div>
    )
}

// ───── Droppable Section ─────
function DroppableSection({
    section,
    shopProducts,
    selectedElementId,
    hoveredElementId,
    editingElementId,
    dropIndicator,
    isDragActive,
    showPreview,
    onSelect,
    onHover,
    onInlineEdit,
    onDoubleClick,
    onDragStartElement,
    onDragEndElement,
    onDragOverSection,
    onDropSection,
    onDeleteElement,
    onDuplicateElement,
    onToggleCollapse,
    onAddSection,
    onDeleteSection,
    onDropInColumn,
    onDragStartInColumn,
    onChangeColumnCount,
}: {
    section: BuilderSection
    shopProducts: ProductRecord[]
    selectedElementId: string | null
    hoveredElementId: string | null
    editingElementId: string | null
    dropIndicator: { sectionId: string; index: number } | null
    isDragActive: boolean
    showPreview: boolean
    onSelect: (elementId: string, sectionId: string) => void
    onHover: (id: string | null) => void
    onInlineEdit: (id: string, content: string) => void
    onDoubleClick: (id: string) => void
    onDragStartElement: (
        e: React.DragEvent,
        elementId: string,
        sectionId: string,
        index: number
    ) => void
    onDragEndElement: () => void
    onDragOverSection: (
        e: React.DragEvent,
        sectionId: string,
        index: number
    ) => void
    onDropSection: (e: React.DragEvent, sectionId: string) => void
    onDeleteElement: (id: string) => void
    onDuplicateElement: (id: string) => void
    onToggleCollapse: (id: string) => void
    onAddSection: (afterId: string) => void
    onDeleteSection: (id: string) => void
    onDropInColumn: (
        sectionId: string,
        parentId: string,
        colIndex: number,
        insertIndex: number,
        dragData: DragData
    ) => void
    onDragStartInColumn: (
        e: React.DragEvent,
        elementId: string,
        parentId: string,
        colIndex: number,
        index: number
    ) => void
    onChangeColumnCount: (elementId: string, count: number) => void
}) {
    const elements = section.elements
    const isCollapsed = section.collapsed
    const showDropAfter =
        dropIndicator &&
        dropIndicator.sectionId === section.id &&
        dropIndicator.index === elements.length

    return (
        <div
            className={`rounded-lg border-2 transition-all duration-200 mb-3 relative ${isDragActive
                ? "border-dashed border-blue-300 bg-blue-50/20"
                : "border-transparent hover:border-border"
                }`}
            onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "copy"
                if (elements.length === 0) {
                    onDragOverSection(e, section.id, 0)
                }
            }}
            onDrop={(e) => onDropSection(e, section.id)}
        >
            {/* Section header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 rounded-t-lg group/section">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onToggleCollapse(section.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronUp className="h-3.5 w-3.5" />
                        )}
                    </button>
                    <span className="text-xs font-semibold text-foreground">
                        {section.name}
                    </span>
                    <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 font-normal"
                    >
                        {elements.length}
                    </Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                    <button
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => onAddSection(section.id)}
                        title="Add section below"
                    >
                        <Plus className="h-3 w-3" />
                    </button>
                    <button
                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => onDeleteSection(section.id)}
                        title="Delete section"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Section content */}
            {!isCollapsed && (
                <div className="p-4 pl-8 space-y-2 min-h-[60px]">
                    {elements.length === 0 && isDragActive && (
                        <div className="py-10 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/40 flex flex-col items-center justify-center gap-2">
                            <Plus className="h-5 w-5 text-blue-400" />
                            <p className="text-sm text-blue-500 font-medium">
                                Drop element here
                            </p>
                        </div>
                    )}
                    {elements.length === 0 && !isDragActive && (
                        <div className="py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
                            <MousePointerClick className="h-6 w-6" />
                            <p className="text-xs">
                                Drag elements from the left panel to add them here
                            </p>
                        </div>
                    )}
                    {elements.map((element, index) => {
                        const showDropBefore =
                            dropIndicator &&
                            dropIndicator.sectionId === section.id &&
                            dropIndicator.index === index

                        return (
                            <div key={element.id}>
                                {showDropBefore && <DropLine />}
                                <div
                                    onDragOver={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onDragOverSection(e, section.id, index)
                                    }}
                                >
                                    {element.type === "columns" ? (
                                        <div
                                            className={`relative group transition-all duration-100 rounded ${element.id === selectedElementId
                                                ? "ring-2 ring-blue-500 ring-offset-2"
                                                : element.id === hoveredElementId
                                                    ? "ring-1 ring-blue-300 ring-offset-1"
                                                    : ""
                                                }`}
                                            onMouseEnter={() => onHover(element.id)}
                                            onMouseLeave={() => onHover(null)}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onSelect(element.id, section.id)
                                            }}
                                        >
                                            {element.id === selectedElementId && (
                                                <div className="absolute -top-8 left-0 z-30 flex items-center gap-0.5 bg-foreground text-background rounded-md px-1 py-0.5 shadow-lg">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] h-4 px-1 font-normal capitalize bg-foreground text-background border-none hover:bg-foreground"
                                                    >
                                                        columns
                                                    </Badge>
                                                    <div className="w-px h-3 bg-background/30 mx-0.5" />
                                                    <button
                                                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-background/20 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDuplicateElement(element.id)
                                                        }}
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/80 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDeleteElement(element.id)
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <ColumnElement
                                                element={element}
                                                shopProducts={shopProducts}
                                                selectedElementId={selectedElementId}
                                                hoveredElementId={hoveredElementId}
                                                editingElementId={editingElementId}
                                                showPreview={showPreview}
                                                onSelect={onSelect}
                                                onHover={onHover}
                                                onInlineEdit={onInlineEdit}
                                                onDoubleClick={onDoubleClick}
                                                onDropInColumn={(_, parentId, colIdx, insertIdx, data) =>
                                                    onDropInColumn(
                                                        section.id,
                                                        parentId,
                                                        colIdx,
                                                        insertIdx,
                                                        data
                                                    )
                                                }
                                                onDragStartInColumn={onDragStartInColumn}
                                                onDragEndElement={onDragEndElement}
                                                onDeleteElement={onDeleteElement}
                                                onDuplicateElement={onDuplicateElement}
                                                onChangeColumnCount={onChangeColumnCount}
                                            />
                                        </div>
                                    ) : (
                                        <CanvasElement
                                            element={element}
                                            shopProducts={shopProducts}
                                            sectionId={section.id}
                                            index={index}
                                            selectedElementId={selectedElementId}
                                            hoveredElementId={hoveredElementId}
                                            editingElementId={editingElementId}
                                            showPreview={showPreview}
                                            onSelect={onSelect}
                                            onHover={onHover}
                                            onInlineEdit={onInlineEdit}
                                            onDoubleClick={onDoubleClick}
                                            onDragStart={(e) => {
                                                onDragStartElement(e, element.id, section.id, index)
                                            }}
                                            onDragEnd={onDragEndElement}
                                            onDeleteElement={onDeleteElement}
                                            onDuplicateElement={onDuplicateElement}
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {showDropAfter && <DropLine />}
                </div>
            )}
        </div>
    )
}

// ───── Main Canvas ─────
export function BuilderCanvas({
    sections,
    shopProducts,
    setSections,
    selectedElementId,
    setSelectedElementId,
    selectedSectionId,
    setSelectedSectionId,
    hoveredElementId,
    setHoveredElementId,
    editingElementId,
    setEditingElementId,
    activeDevice,
    showPreview,
}: {
    sections: BuilderSection[]
    shopProducts: ProductRecord[]
    setSections: (updater: BuilderSection[] | ((prev: BuilderSection[]) => BuilderSection[])) => void
    selectedElementId: string | null
    setSelectedElementId: (id: string | null) => void
    selectedSectionId: string | null
    setSelectedSectionId: (id: string | null) => void
    hoveredElementId: string | null
    setHoveredElementId: (id: string | null) => void
    editingElementId: string | null
    setEditingElementId: (id: string | null) => void
    activeDevice: string
    showPreview: boolean
}) {
    const [dropIndicator, setDropIndicator] = useState<{
        sectionId: string
        index: number
    } | null>(null)
    const [isDragActive, setIsDragActive] = useState(false)
    const canvasRef = useRef<HTMLDivElement>(null)
    const dragSourceRef = useRef<DragData | null>(null)

    const resetDragState = useCallback(() => {
        setIsDragActive(false)
        setDropIndicator(null)
        dragSourceRef.current = null
    }, [])

    // ── Select handler ──
    const handleSelect = useCallback(
        (elementId: string, sectionId: string) => {
            setSelectedElementId(elementId)
            if (sectionId) setSelectedSectionId(sectionId)
        },
        [setSelectedElementId, setSelectedSectionId]
    )

    // ── Inline edit ──
    const handleInlineEdit = useCallback(
        (elementId: string, content: string) => {
            setSections((prev) =>
                prev.map((s) => ({
                    ...s,
                    elements: s.elements.map((el) => {
                        if (el.id === elementId) return { ...el, content }
                        if (el.type === "columns" && el.columnElements) {
                            return {
                                ...el,
                                columnElements: el.columnElements.map((col) =>
                                    col.map((child) =>
                                        child.id === elementId ? { ...child, content } : child
                                    )
                                ),
                            }
                        }
                        return el
                    }),
                }))
            )
            setEditingElementId(null)
        },
        [setSections, setEditingElementId]
    )

    const handleDoubleClick = useCallback(
        (id: string) => {
            // Find element to check if it's editable text
            for (const s of sections) {
                const el = s.elements.find((e) => e.id === id)
                if (
                    el &&
                    (el.type === "heading" ||
                        el.type === "paragraph" ||
                        el.type === "button")
                ) {
                    setEditingElementId(id)
                    return
                }
                // Check in columns
                for (const e of s.elements) {
                    if (e.type === "columns" && e.columnElements) {
                        for (const col of e.columnElements) {
                            const child = col.find((c) => c.id === id)
                            if (
                                child &&
                                (child.type === "heading" ||
                                    child.type === "paragraph" ||
                                    child.type === "button")
                            ) {
                                setEditingElementId(id)
                                return
                            }
                        }
                    }
                }
            }
        },
        [sections, setEditingElementId]
    )

    // ── Drag over section (for drop indicator position) ──
    const handleDragOverSection = useCallback(
        (e: React.DragEvent, sectionId: string, index: number) => {
            e.preventDefault()
            setIsDragActive(true)
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
            const midY = rect.top + rect.height / 2
            const adjustedIndex = e.clientY < midY ? index : index + 1
            setDropIndicator({ sectionId, index: adjustedIndex })
        },
        []
    )

    const handleDragStartElement = useCallback(
        (e: React.DragEvent, elementId: string, sectionId: string, index: number) => {
            const dragData: DragData = {
                sourceType: "canvas",
                elementId,
                sectionId,
                index,
            }
            dragSourceRef.current = dragData
            setIsDragActive(true)
            e.dataTransfer.setData(DRAG_TYPE_KEY, JSON.stringify(dragData))
            e.dataTransfer.effectAllowed = "move"
        },
        []
    )

    // ── Drop on section ──
    const handleDropSection = useCallback(
        (e: React.DragEvent, sectionId: string) => {
            e.preventDefault()
            const indicator = dropIndicator
            try {
                const raw = e.dataTransfer.getData(DRAG_TYPE_KEY)
                if (!raw) return
                const dragData = JSON.parse(raw) as DragData
                const insertIdx = indicator?.sectionId === sectionId ? indicator.index : 0

                if (dragData.sourceType === "sidebar" && dragData.elementType) {
                    // Dragging from sidebar - create new element
                    const newEl = createNewElement(dragData.elementType)
                    setSections((prev) =>
                        prev.map((s) => {
                            if (s.id !== sectionId) return s
                            const els = [...s.elements]
                            els.splice(insertIdx, 0, newEl)
                            els.forEach((el, i) => (el.order = i))
                            return { ...s, elements: els }
                        })
                    )
                    setSelectedElementId(newEl.id)
                    setSelectedSectionId(sectionId)
                } else if (dragData.sourceType === "canvas" && dragData.elementId) {
                    // Dragging existing element within canvas
                    setSections((prev) => {
                        const newSections = JSON.parse(
                            JSON.stringify(prev)
                        ) as BuilderSection[]
                        // Find and remove from source
                        let movedElement: BuilderElement | null = null
                        for (const s of newSections) {
                            const idx = s.elements.findIndex(
                                (el) => el.id === dragData.elementId
                            )
                            if (idx !== -1) {
                                ;[movedElement] = s.elements.splice(idx, 1)
                                break
                            }
                            // Check inside columns
                            for (const el of s.elements) {
                                if (el.type === "columns" && el.columnElements) {
                                    for (const col of el.columnElements) {
                                        const cidx = col.findIndex(
                                            (c) => c.id === dragData.elementId
                                        )
                                        if (cidx !== -1) {
                                            ;[movedElement] = col.splice(cidx, 1)
                                            break
                                        }
                                    }
                                    if (movedElement) break
                                }
                            }
                            if (movedElement) break
                        }
                        if (!movedElement) return prev

                        // Insert at target
                        const targetSection = newSections.find((s) => s.id === sectionId)
                        if (!targetSection) return prev
                        // Recalculate insert index (element may have been removed from same section)
                        let finalIdx = Math.min(insertIdx, targetSection.elements.length)
                        targetSection.elements.splice(finalIdx, 0, movedElement)
                        targetSection.elements.forEach((el, i) => (el.order = i))
                        return newSections
                    })
                }
            } catch {
                // ignore
            }
            resetDragState()
        },
        [
            dropIndicator,
            resetDragState,
            setSections,
            setSelectedElementId,
            setSelectedSectionId,
        ]
    )

    // ── Drop in column ──
    const handleDropInColumn = useCallback(
        (
            sectionId: string,
            parentId: string,
            colIndex: number,
            insertIndex: number,
            dragData: DragData
        ) => {
            if (dragData.sourceType === "sidebar" && dragData.elementType) {
                const newEl = createNewElement(dragData.elementType)
                setSections((prev) =>
                    prev.map((s) => ({
                        ...s,
                        elements: s.elements.map((el) => {
                            if (el.id !== parentId || !el.columnElements) return el
                            const cols = el.columnElements.map((col, ci) => {
                                if (ci !== colIndex) return col
                                const newCol = [...col]
                                newCol.splice(insertIndex, 0, newEl)
                                return newCol
                            })
                            return { ...el, columnElements: cols }
                        }),
                    }))
                )
                setSelectedElementId(newEl.id)
            } else if (dragData.sourceType === "canvas" && dragData.elementId) {
                setSections((prev) => {
                    const newSections = JSON.parse(
                        JSON.stringify(prev)
                    ) as BuilderSection[]
                    let movedElement: BuilderElement | null = null

                    // Remove from source
                    for (const s of newSections) {
                        const idx = s.elements.findIndex(
                            (el) => el.id === dragData.elementId
                        )
                        if (idx !== -1) {
                            ;[movedElement] = s.elements.splice(idx, 1)
                            break
                        }
                        for (const el of s.elements) {
                            if (el.type === "columns" && el.columnElements) {
                                for (const col of el.columnElements) {
                                    const cidx = col.findIndex(
                                        (c) => c.id === dragData.elementId
                                    )
                                    if (cidx !== -1) {
                                        ;[movedElement] = col.splice(cidx, 1)
                                        break
                                    }
                                }
                                if (movedElement) break
                            }
                        }
                        if (movedElement) break
                    }
                    if (!movedElement) return prev

                    // Insert into column
                    for (const s of newSections) {
                        for (const el of s.elements) {
                            if (el.id === parentId && el.columnElements) {
                                if (!el.columnElements[colIndex]) {
                                    el.columnElements[colIndex] = []
                                }
                                el.columnElements[colIndex].splice(insertIndex, 0, movedElement)
                                return newSections
                            }
                        }
                    }
                    return prev
                })
            }
        },
        [setSections, setSelectedElementId]
    )

    const handleDragStartInColumn = useCallback(
        (
            e: React.DragEvent,
            elementId: string,
            parentId: string,
            colIndex: number,
            index: number
        ) => {
            const dragData: DragData = {
                sourceType: "canvas",
                elementId,
                sectionId: parentId,
                index,
            }
            dragSourceRef.current = dragData
            setIsDragActive(true)
            e.dataTransfer.setData(DRAG_TYPE_KEY, JSON.stringify(dragData))
            e.dataTransfer.effectAllowed = "move"
        },
        []
    )

    // ── Delete / Duplicate ──
    const handleDeleteElement = useCallback(
        (id: string) => {
            setSections((prev) =>
                prev.map((s) => ({
                    ...s,
                    elements: s.elements
                        .filter((el) => el.id !== id)
                        .map((el) => {
                            if (el.type === "columns" && el.columnElements) {
                                return {
                                    ...el,
                                    columnElements: el.columnElements.map((col) =>
                                        col.filter((c) => c.id !== id)
                                    ),
                                }
                            }
                            return el
                        }),
                }))
            )
            if (selectedElementId === id) setSelectedElementId(null)
        },
        [setSections, selectedElementId, setSelectedElementId]
    )

    const handleDuplicateElement = useCallback(
        (id: string) => {
            setSections((prev) =>
                prev.map((s) => {
                    const idx = s.elements.findIndex((el) => el.id === id)
                    if (idx !== -1) {
                        const clone = JSON.parse(JSON.stringify(s.elements[idx]))
                        clone.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
                        const els = [...s.elements]
                        els.splice(idx + 1, 0, clone)
                        return { ...s, elements: els }
                    }
                    // Check inside columns
                    return {
                        ...s,
                        elements: s.elements.map((el) => {
                            if (el.type === "columns" && el.columnElements) {
                                return {
                                    ...el,
                                    columnElements: el.columnElements.map((col) => {
                                        const cidx = col.findIndex((c) => c.id === id)
                                        if (cidx === -1) return col
                                        const clone = JSON.parse(JSON.stringify(col[cidx]))
                                        clone.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
                                        const newCol = [...col]
                                        newCol.splice(cidx + 1, 0, clone)
                                        return newCol
                                    }),
                                }
                            }
                            return el
                        }),
                    }
                })
            )
        },
        [setSections]
    )

    // ── Toggle section collapse ──
    const handleToggleCollapse = useCallback(
        (id: string) => {
            setSections((prev) =>
                prev.map((s) =>
                    s.id === id ? { ...s, collapsed: !s.collapsed } : s
                )
            )
        },
        [setSections]
    )

    // ── Add / Delete section ──
    const handleAddSection = useCallback(
        (afterId: string) => {
            const newSection: BuilderSection = {
                id: `section-${Date.now()}`,
                name: "New Section",
                elements: [],
            }
            setSections((prev) => {
                const idx = prev.findIndex((s) => s.id === afterId)
                const newSections = [...prev]
                newSections.splice(idx + 1, 0, newSection)
                return newSections
            })
        },
        [setSections]
    )

    const handleDeleteSection = useCallback(
        (id: string) => {
            setSections((prev) => prev.filter((s) => s.id !== id))
        },
        [setSections]
    )

    // ── Change column count ──
    const handleChangeColumnCount = useCallback(
        (elementId: string, count: number) => {
            setSections((prev) =>
                prev.map((s) => ({
                    ...s,
                    elements: s.elements.map((el) => {
                        if (el.id !== elementId) return el
                        const existing = el.columnElements || []
                        const newCols: BuilderElement[][] = []
                        for (let i = 0; i < count; i++) {
                            newCols.push(existing[i] || [])
                        }
                        return { ...el, columnCount: count, columnElements: newCols }
                    }),
                }))
            )
        },
        [setSections]
    )

    // ── Canvas global drag listeners ──
    const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragActive(true)
    }, [])

    const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
        if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
            resetDragState()
        }
    }, [resetDragState])

    const handleCanvasDrop = useCallback(() => {
        resetDragState()
    }, [resetDragState])

    const deviceMaxWidth =
        activeDevice === "mobile"
            ? "max-w-[375px]"
            : activeDevice === "tablet"
                ? "max-w-[768px]"
                : ""

    // ── Preview mode ──
    if (showPreview) {
        return (
            <div
                className={`flex-1 ${deviceMaxWidth} mx-auto overflow-auto bg-muted/10`}
            >
                <div className="h-full w-full p-6">
                    <div className="rounded-lg border bg-background shadow-sm p-8">
                        {sections.map((section) => (
                            <div key={section.id} className="mb-6">
                                {section.elements.map((el) => (
                                    <div key={el.id}>
                                        {el.type === "columns" ? (
                                            <div
                                                className="grid gap-4"
                                                style={{
                                                    gridTemplateColumns: `repeat(${el.columnCount || 2}, 1fr)`,
                                                }}
                                            >
                                                {(el.columnElements || []).map((col, ci) => (
                                                    <div key={ci}>
                                                        {col.map((child) => (
                                                            <RenderElement
                                                                key={child.id}
                                                                element={child}
                                                                isEditing={false}
                                                                shopProducts={shopProducts}
                                                                showPreview={showPreview}
                                                                onInlineEdit={() => { }}
                                                            />
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <RenderElement
                                                element={el}
                                                isEditing={false}
                                                showPreview={showPreview}
                                                shopProducts={shopProducts}
                                                onInlineEdit={() => { }}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={canvasRef}
            className={`flex-1 ${deviceMaxWidth} mx-auto overflow-auto bg-muted/10`}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            onClick={() => {
                setSelectedElementId(null)
                setEditingElementId(null)
            }}
        >
            <div className="h-full w-full p-4 relative">
                {/* Hint bar */}
                <div className="mb-3 flex items-center gap-3 text-[11px] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                    <span>Drag from left panel</span>
                    <span className="text-border">|</span>
                    <span>Double-click to edit text</span>
                    <span className="text-border">|</span>
                    <span>Del to remove</span>
                    <span className="text-border">|</span>
                    <span>Ctrl+D to duplicate</span>
                </div>

                <div className="min-h-[calc(100vh-8rem)] rounded-lg border bg-background shadow-sm p-4">
                    {sections.map((section) => (
                        <DroppableSection
                            key={section.id}
                            section={section}
                            shopProducts={shopProducts}
                            selectedElementId={selectedElementId}
                            hoveredElementId={hoveredElementId}
                            editingElementId={editingElementId}
                            dropIndicator={dropIndicator}
                            isDragActive={isDragActive}
                            showPreview={showPreview}
                            onSelect={handleSelect}
                            onHover={setHoveredElementId}
                            onInlineEdit={handleInlineEdit}
                            onDoubleClick={handleDoubleClick}
                            onDragStartElement={handleDragStartElement}
                            onDragEndElement={resetDragState}
                            onDragOverSection={handleDragOverSection}
                            onDropSection={handleDropSection}
                            onDeleteElement={handleDeleteElement}
                            onDuplicateElement={handleDuplicateElement}
                            onToggleCollapse={handleToggleCollapse}
                            onAddSection={handleAddSection}
                            onDeleteSection={handleDeleteSection}
                            onDropInColumn={handleDropInColumn}
                            onDragStartInColumn={handleDragStartInColumn}
                            onChangeColumnCount={handleChangeColumnCount}
                        />
                    ))}

                    {/* Add section button at bottom */}
                    <button
                        onClick={() => handleAddSection(sections[sections.length - 1]?.id || "")}
                        className="w-full py-3 border-2 border-dashed border-muted-foreground/20 rounded-lg text-muted-foreground/50 hover:border-muted-foreground/40 hover:text-muted-foreground transition-colors text-xs font-medium flex items-center justify-center gap-2"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Section
                    </button>
                </div>
            </div>
        </div>
    )
}
