// ───── Element Types ─────
export type ElementType =
    | "heading"
    | "paragraph"
    | "image"
    | "button"
    | "search-bar"
    | "hero-slider"
    | "oauth-login"
    | "navigation"
    | "list"
    | "custom-code"
    | "divider"
    | "spacer"
    | "video"
    | "columns"
    // New elements
    | "quote"
    | "icon"
    | "social-links"
    | "form-input"
    | "form-textarea"
    | "form"
    | "table"
    | "progress"
    | "badge-element"
    | "accordion"
    | "embed"
    | "map"
    | "countdown"
    | "gallery"
    | "product-card"
    | "product-grid"
    | "recommended-products"
    | "product-filters"
    | "shopping-cart"
    // shadcn/ui components
    | "card-element"
    | "tabs-element"
    | "avatar-element"
    | "alert-element"
    | "dialog-element"
    | "popover-element"
    | "collapsible-element"
    | "hover-card-element"
    | "skeleton-element"
    | "select-element"
    | "checkbox-element"
    | "switch-element"
    | "slider-element"
    | "carousel-element"
    | "command-element"
    | "radio-group-element"
    | "breadcrumb-element"
    | "pagination-element"
    | "callout"
    | "ribbon"


export interface ElementStyles {
    width: string
    height?: string
    alignment: "left" | "center" | "right"
    margin: { top: string; right: string; bottom: string; left: string }
    padding: { top: string; right: string; bottom: string; left: string }
    color: string
    backgroundColor: string
    fontSize: string
    fontWeight: string
    fontStyle: string
    textDecoration: string
    borderRadius?: string
    border?: string
    opacity?: string
    boxShadow?: string
    letterSpacing?: string
    lineHeight?: string
    backgroundImage?: string
    price?: string
}

export interface BuilderElement {
    id: string
    type: ElementType
    content: string
    htmlId: string
    cssClasses: string
    styles: ElementStyles
    children: BuilderElement[]
    parentId: string | null
    order: number
    // Column-specific
    columnCount?: number
    columnElements?: BuilderElement[][]
    // Form-specific
    placeholder?: string
    label?: string
    // Link-specific
    href?: string
    openInNewTab?: boolean
    mediaItems?: string[]
    // Commerce-specific
    dataSource?: "manual" | "shop-products"
    productId?: string | null
    productLimit?: number
}

export interface BuilderSection {
    id: string
    name: string
    elements: BuilderElement[]
    collapsed?: boolean
}

// ───── Multi-Page Support ─────
export interface BuilderPage {
    id: string
    name: string
    slug: string
    sections: BuilderSection[]
    isHome?: boolean
}

// ───── Drag Source Info ─────
export type DragSourceType = "sidebar" | "canvas"

export interface DragData {
    sourceType: DragSourceType
    elementType?: ElementType
    elementId?: string
    sectionId?: string
    index?: number
}

// ───── Sidebar Element Catalog ─────
export interface CatalogItem {
    type: ElementType
    label: string
    icon: string
    category: "layout" | "basic" | "media" | "advanced" | "forms" | "interactive" | "shadcn"
    description: string
}

export const ELEMENT_CATALOG: CatalogItem[] = [
    // Layout
    { type: "columns", label: "Columns", icon: "Columns3", category: "layout", description: "Multi-column layout" },
    { type: "divider", label: "Divider", icon: "Minus", category: "layout", description: "Horizontal line" },
    { type: "spacer", label: "Spacer", icon: "MoveVertical", category: "layout", description: "Vertical space" },

    // Basic
    { type: "heading", label: "Heading", icon: "Heading1", category: "basic", description: "Title text" },
    { type: "paragraph", label: "Text", icon: "Type", category: "basic", description: "Body text" },
    { type: "button", label: "Button", icon: "RectangleHorizontal", category: "basic", description: "Clickable button" },
    { type: "search-bar", label: "Search Bar", icon: "Search", category: "basic", description: "Store search input" },
    { type: "oauth-login", label: "OAuth Login", icon: "LogIn", category: "basic", description: "Customer sign-in CTA" },
    { type: "navigation", label: "Nav Links", icon: "Menu", category: "basic", description: "Navigation menu" },
    { type: "list", label: "List", icon: "List", category: "basic", description: "Bulleted list" },
    { type: "quote", label: "Quote", icon: "Quote", category: "basic", description: "Block quote" },
    { type: "badge-element", label: "Badge", icon: "Tag", category: "basic", description: "Label badge" },
    { type: "icon", label: "Icon", icon: "Star", category: "basic", description: "Decorative icon" },

    // Media
    { type: "image", label: "Image", icon: "ImageIcon", category: "media", description: "Picture element" },
    { type: "hero-slider", label: "Hero Slider", icon: "Images", category: "media", description: "Rotating hero banners" },
    { type: "video", label: "Video", icon: "Play", category: "media", description: "Embed video" },
    { type: "gallery", label: "Gallery", icon: "LayoutGrid", category: "media", description: "Image gallery" },
    { type: "map", label: "Map", icon: "MapPin", category: "media", description: "Google Map" },
    { type: "embed", label: "Embed", icon: "ExternalLink", category: "media", description: "External embed" },
    { type: "social-links", label: "Social Icons", icon: "Share2", category: "media", description: "Social media links" },

    // e-Commerce
    { type: "product-card", label: "Product Card", icon: "ShoppingCart", category: "advanced", description: "Individual product display" },
    { type: "product-grid", label: "Product Grid", icon: "Store", category: "advanced", description: "Grid of shop products" },
    { type: "recommended-products", label: "Recommendations", icon: "Sparkles", category: "advanced", description: "Recommended products shelf" },
    { type: "product-filters", label: "Product Filters", icon: "SlidersHorizontal", category: "advanced", description: "Filterable product listing" },
    { type: "shopping-cart", label: "Shopping Cart", icon: "ShoppingBag", category: "advanced", description: "Cart summary" },


    // Forms
    { type: "form", label: "Contact Form", icon: "Mail", category: "forms", description: "Full form block" },
    { type: "form-input", label: "Input Field", icon: "TextCursorInput", category: "forms", description: "Text input" },
    { type: "form-textarea", label: "Textarea", icon: "AlignLeft", category: "forms", description: "Multi-line input" },

    // Interactive
    { type: "accordion", label: "Accordion", icon: "ChevronsUpDown", category: "interactive", description: "Collapsible content" },
    { type: "table", label: "Table", icon: "Table", category: "interactive", description: "Data table" },
    { type: "progress", label: "Progress Bar", icon: "BarChart3", category: "interactive", description: "Progress indicator" },
    { type: "countdown", label: "Countdown", icon: "Clock", category: "interactive", description: "Timer countdown" },

    // Advanced
    { type: "custom-code", label: "HTML Code", icon: "Code", category: "advanced", description: "Custom HTML/CSS" },

    // shadcn/ui Components
    { type: "card-element", label: "Card", icon: "CreditCard", category: "shadcn", description: "Card container" },
    { type: "tabs-element", label: "Tabs", icon: "PanelTop", category: "shadcn", description: "Tab navigation panel" },
    { type: "avatar-element", label: "Avatar", icon: "UserCircle2", category: "shadcn", description: "User avatar" },
    { type: "alert-element", label: "Alert", icon: "AlertCircle", category: "shadcn", description: "Alert/notification box" },
    { type: "dialog-element", label: "Dialog", icon: "AppWindow", category: "shadcn", description: "Modal dialog trigger" },
    { type: "popover-element", label: "Popover", icon: "MessageCircle", category: "shadcn", description: "Floating popover" },
    { type: "collapsible-element", label: "Collapsible", icon: "ChevronsUpDown", category: "shadcn", description: "Collapsible content" },
    { type: "hover-card-element", label: "Hover Card", icon: "MousePointer2", category: "shadcn", description: "Card revealed on hover" },
    { type: "skeleton-element", label: "Skeleton", icon: "Rows3", category: "shadcn", description: "Loading skeleton" },
    { type: "select-element", label: "Select", icon: "ListFilter", category: "shadcn", description: "Dropdown select" },
    { type: "checkbox-element", label: "Checkbox", icon: "CheckSquare", category: "shadcn", description: "Checkbox input" },
    { type: "switch-element", label: "Switch", icon: "ToggleLeft", category: "shadcn", description: "Toggle switch" },
    { type: "slider-element", label: "Slider", icon: "SlidersHorizontal", category: "shadcn", description: "Range slider" },
    { type: "carousel-element", label: "Carousel", icon: "GalleryHorizontal", category: "shadcn", description: "Sliding carousel" },
    { type: "command-element", label: "Command", icon: "CommandIcon", category: "shadcn", description: "Command palette search" },
    { type: "radio-group-element", label: "Radio Group", icon: "CircleDot", category: "shadcn", description: "Radio button group" },
    { type: "breadcrumb-element", label: "Breadcrumb", icon: "ChevronRight", category: "shadcn", description: "Breadcrumb navigation" },
    { type: "pagination-element", label: "Pagination", icon: "MoreHorizontal", category: "shadcn", description: "Page pagination" },
    { type: "callout", label: "Callout", icon: "Info", category: "shadcn", description: "Info callout box" },
    { type: "ribbon", label: "Ribbon", icon: "Flag", category: "shadcn", description: "Banner ribbon" },
]

// ───── Default content for new elements ─────
export function getDefaultContent(type: ElementType): string {
    switch (type) {
        case "heading":
            return "New Heading"
        case "paragraph":
            return "This is a new paragraph. Click to edit this text and add your own content."
        case "button":
            return "Click Me"
        case "search-bar":
            return "Search products, collections, and categories"
        case "oauth-login":
            return "Continue with Google"
        case "image":
            return "/placeholder.svg?height=200&width=400"
        case "hero-slider":
            return [
                "Fresh arrivals|Discover this week's best sellers|/placeholder.svg?height=420&width=1200",
                "Build your storefront|Swap banners, products, and copy in seconds|/placeholder.svg?height=420&width=1200",
                "Launch seasonal drops|Run promotions with custom hero slides|/placeholder.svg?height=420&width=1200",
            ].join("\n")
        case "navigation":
            return '<a href="#">Home</a><a href="#">About</a><a href="#">Services</a><a href="#">Contact</a>'
        case "list":
            return "<li>First item in the list</li><li>Second item in the list</li><li>Third item in the list</li>"
        case "custom-code":
            return '<div style="padding:20px;background:#f5f5f5;border-radius:8px;text-align:center;">\n  <p>Custom HTML Block</p>\n</div>'
        case "divider":
            return ""
        case "spacer":
            return ""
        case "video":
            return "https://www.youtube.com/embed/dQw4w9WgXcQ"
        case "columns":
            return ""
        case "quote":
            return "The best way to predict the future is to invent it. — Alan Kay"
        case "icon":
            return "star"
        case "social-links":
            return "twitter,facebook,instagram,linkedin"
        case "form-input":
            return "Email Address"
        case "form-textarea":
            return "Your Message"
        case "form":
            return "Contact Us"
        case "table":
            return "Name,Email,Role\nJohn Doe,john@example.com,Designer\nJane Smith,jane@example.com,Developer\nBob Wilson,bob@example.com,Manager"
        case "progress":
            return "75"
        case "badge-element":
            return "New Feature"
        case "accordion":
            return "What is this?|This is an accordion element that can show/hide content.\nHow does it work?|Click on the question to expand or collapse the answer.\nCan I customize it?|Yes, you can change the text content in the properties panel."
        case "embed":
            return "https://codepen.io"
        case "map":
            return "New York, NY"
        case "countdown":
            return "2026-12-31T00:00:00"
        case "gallery":
            return "/placeholder.svg?height=200&width=200,/placeholder.svg?height=200&width=200,/placeholder.svg?height=200&width=200,/placeholder.svg?height=200&width=200"
        case "product-card":
            return "Signature Product"
        case "product-grid":
            return "Shop all products"
        case "recommended-products":
            return "Recommended for you"
        case "product-filters":
            return "Browse Products"
        case "shopping-cart":
            return "Cart"
        case "card-element":
            return "Card Title|This is the card description with supporting text.|Card Footer"
        case "tabs-element":
            return "Tab 1|Content for tab one goes here.\nTab 2|Content for tab two goes here.\nTab 3|Content for tab three goes here."
        case "avatar-element":
            return "John Doe|JD"
        case "alert-element":
            return "Heads up!|You can add components to your website using the sidebar."
        case "dialog-element":
            return "Open Dialog|Dialog Title|This is the dialog content. You can put anything here."
        case "popover-element":
            return "Open Popover|Popover Title|This is popover content."
        case "collapsible-element":
            return "Toggle Section|This is the hidden collapsible content that appears when you click the trigger."
        case "hover-card-element":
            return "Hover me|@username|Bio or description shown on hover."
        case "skeleton-element":
            return "3"
        case "select-element":
            return "Select an option|Option 1,Option 2,Option 3,Option 4"
        case "checkbox-element":
            return "Accept terms and conditions|true"
        case "switch-element":
            return "Enable notifications|false"
        case "slider-element":
            return "50|0|100"
        case "carousel-element":
            return "Slide 1|First slide content\nSlide 2|Second slide content\nSlide 3|Third slide content"
        case "command-element":
            return "Search...\nHome\nSettings\nProfile\nHelp"
        case "radio-group-element":
            return "default|Option A,Option B,Option C"
        case "breadcrumb-element":
            return "Home,Products,Electronics,Headphones"
        case "pagination-element":
            return "1|10"
        case "callout":
            return "info|Note|This is an important callout message for your visitors."
        case "ribbon":
            return "New|Sale ends soon!"
        default:
            return ""
    }
}

export function getDefaultStyles(type: ElementType): ElementStyles {
    const base: ElementStyles = {
        width: "100%",
        alignment: "left",
        margin: { top: "0", right: "0", bottom: "12", left: "0" },
        padding: { top: "0", right: "0", bottom: "0", left: "0" },
        color: "#1a1a1a",
        backgroundColor: "transparent",
        fontSize: "16px",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
    }

    switch (type) {
        case "heading":
            return { ...base, fontSize: "28px", fontWeight: "bold" }
        case "paragraph":
            return { ...base, color: "#555555" }
        case "button":
            return {
                ...base,
                width: "auto",
                color: "#ffffff",
                backgroundColor: "#1a1a1a",
                fontSize: "14px",
                fontWeight: "500",
                padding: { top: "10", right: "24", bottom: "10", left: "24" },
                borderRadius: "6px",
            }
        case "search-bar":
            return {
                ...base,
                color: "#111827",
                backgroundColor: "#ffffff",
                padding: { top: "12", right: "18", bottom: "12", left: "18" },
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            }
        case "oauth-login":
            return {
                ...base,
                width: "auto",
                backgroundColor: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: "12px",
                padding: { top: "12", right: "18", bottom: "12", left: "18" },
                boxShadow: "0 12px 24px rgba(37, 99, 235, 0.08)",
            }
        case "image":
            return { ...base, width: "100%" }
        case "hero-slider":
            return {
                ...base,
                width: "100%",
                height: "420px",
                color: "#ffffff",
                backgroundColor: "#111827",
                borderRadius: "24px",
                padding: { top: "32", right: "32", bottom: "32", left: "32" },
            }
        case "divider":
            return { ...base, margin: { top: "16", right: "0", bottom: "16", left: "0" } }
        case "spacer":
            return { ...base, height: "40px" }
        case "video":
            return { ...base, width: "100%", height: "315px" }
        case "columns":
            return { ...base, padding: { top: "8", right: "0", bottom: "8", left: "0" } }
        case "quote":
            return {
                ...base,
                color: "#444",
                fontSize: "18px",
                fontStyle: "italic",
                padding: { top: "16", right: "24", bottom: "16", left: "24" },
                border: "3px solid #e5e5e5",
                borderRadius: "4px",
                backgroundColor: "#fafafa",
            }
        case "icon":
            return { ...base, fontSize: "32px", alignment: "center" }
        case "social-links":
            return { ...base, alignment: "center" }
        case "form-input":
            return { ...base, padding: { top: "8", right: "12", bottom: "8", left: "12" }, border: "1px solid #d1d5db", borderRadius: "6px" }
        case "form-textarea":
            return { ...base, height: "100px", padding: { top: "8", right: "12", bottom: "8", left: "12" }, border: "1px solid #d1d5db", borderRadius: "6px" }
        case "form":
            return { ...base, padding: { top: "24", right: "24", bottom: "24", left: "24" }, backgroundColor: "#fafafa", borderRadius: "12px", border: "1px solid #e5e5e5" }
        case "table":
            return { ...base }
        case "progress":
            return { ...base, height: "8px", backgroundColor: "#e5e5e5", borderRadius: "999px" }
        case "badge-element":
            return {
                ...base,
                width: "auto",
                fontSize: "12px",
                fontWeight: "500",
                color: "#ffffff",
                backgroundColor: "#1a1a1a",
                padding: { top: "4", right: "12", bottom: "4", left: "12" },
                borderRadius: "999px",
            }
        case "accordion":
            return { ...base, border: "1px solid #e5e5e5", borderRadius: "8px" }
        case "embed":
            return { ...base, width: "100%", height: "400px" }
        case "map":
            return { ...base, width: "100%", height: "300px", borderRadius: "8px" }
        case "countdown":
            return { ...base, fontSize: "32px", fontWeight: "bold", alignment: "center" }
        case "gallery":
            return { ...base }
        case "product-card":
            return {
                ...base,
                width: "100%",
                borderRadius: "18px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                padding: { top: "0", right: "0", bottom: "0", left: "0" },
                backgroundImage: "/placeholder.svg?height=240&width=320",
                price: "49.00",
            }
        case "product-grid":
            return {
                ...base,
                width: "100%",
                padding: { top: "12", right: "0", bottom: "12", left: "0" },
            }
        case "recommended-products":
            return {
                ...base,
                width: "100%",
                padding: { top: "12", right: "0", bottom: "12", left: "0" },
            }
        case "product-filters":
            return {
                ...base,
                width: "100%",
                padding: { top: "12", right: "0", bottom: "12", left: "0" },
            }
        default:
            return base
    }
}

export function createNewElement(type: ElementType): BuilderElement {
    return {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        content: getDefaultContent(type),
        htmlId: "",
        cssClasses: "",
        styles: getDefaultStyles(type),
        children: [],
        parentId: null,
        order: 999,
        ...(type === "columns" ? { columnCount: 2, columnElements: [[], []] } : {}),
        ...(type === "form-input" ? { placeholder: "Enter your email", label: "Email Address" } : {}),
        ...(type === "form-textarea" ? { placeholder: "Type your message here...", label: "Message" } : {}),
        ...(type === "button" ? { href: "#" } : {}),
        ...(type === "search-bar" ? { href: "/products?query={query}" } : {}),
        ...(type === "oauth-login" ? { href: "/login" } : {}),
        ...(type === "product-card" ? { dataSource: "shop-products" as const, productId: null } : {}),
        ...(type === "product-grid" ? { dataSource: "shop-products" as const, productLimit: 4 } : {}),
        ...(type === "recommended-products" ? { dataSource: "shop-products" as const, productLimit: 4 } : {}),
        ...(type === "product-filters" ? { dataSource: "shop-products" as const, productLimit: 8 } : {}),
        ...(type === "product-card" ? { href: "/product/{slug}", mediaItems: ["/placeholder.svg?height=240&width=320"] } : {}),
        ...(type === "hero-slider" ? { mediaItems: ["/placeholder.svg?height=420&width=1200", "/placeholder.svg?height=420&width=1200", "/placeholder.svg?height=420&width=1200"] } : {}),
    }
}

export function createDefaultPage(name: string, slug: string, isHome = false): BuilderPage {
    const hero = createNewElement("heading")
    hero.content = isHome ? "Welcome to Your Website" : name
    hero.styles = { ...hero.styles, fontSize: "36px", fontWeight: "bold", alignment: "center" }

    const sub = createNewElement("paragraph")
    sub.content = isHome
        ? "Build beautiful, responsive websites with our drag-and-drop builder. No coding required."
        : `This is the ${name} page. Start building by dragging elements from the left panel.`
    sub.styles = { ...sub.styles, alignment: "center", color: "#666666" }

    const sections: BuilderSection[] = [
        {
            id: `section-${Date.now()}-hero`,
            name: isHome ? "Hero" : "Header",
            elements: [hero, sub],
        },
    ]

    if (isHome) {
        const heroSlider = createNewElement("hero-slider")
        sections[0].elements.unshift(heroSlider)

        const searchBar = createNewElement("search-bar")
        searchBar.styles = {
            ...searchBar.styles,
            margin: { top: "16", right: "auto", bottom: "20", left: "auto" },
            width: "min(680px, 100%)",
        }
        sections[0].elements.push(searchBar)

        const btn = createNewElement("button")
        btn.content = "Get Started"
        btn.styles = { ...btn.styles, margin: { top: "0", right: "auto", bottom: "16", left: "auto" } }
        sections[0].elements.push(btn)

        const cols = createNewElement("columns")
        const col1p = createNewElement("heading")
        col1p.content = "Feature One"
        col1p.styles = { ...col1p.styles, fontSize: "20px", fontWeight: "bold" }
        const col1d = createNewElement("paragraph")
        col1d.content = "Drag and drop elements to build your page visually."
        col1d.styles = { ...col1d.styles, color: "#666666" }
        const col2p = createNewElement("heading")
        col2p.content = "Feature Two"
        col2p.styles = { ...col2p.styles, fontSize: "20px", fontWeight: "bold" }
        const col2d = createNewElement("paragraph")
        col2d.content = "Customize every element with the properties panel."
        col2d.styles = { ...col2d.styles, color: "#666666" }
        cols.columnElements = [[col1p, col1d], [col2p, col2d]]

        sections.push({
            id: `section-${Date.now()}-features`,
            name: "Features",
            elements: [cols],
        })
    }

    return { id: `page-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, slug, sections, isHome }
}

export function createEcommercePages(shopName = "Your Shop"): BuilderPage[] {
    const home = createDefaultPage(shopName, "", true)
    const catalog = createDefaultPage("Shop", "shop")
    catalog.sections[0].elements[0].content = `${shopName} Collection`
    catalog.sections[0].elements[1].content =
        "Feature best sellers, new arrivals, bundles, and seasonal drops."

    const productHighlights = createNewElement("columns")
    const leftHeading = createNewElement("heading")
    leftHeading.content = "Featured Products"
    leftHeading.styles = { ...leftHeading.styles, fontSize: "22px", fontWeight: "bold" }
    const leftCard = createNewElement("product-card")
    leftCard.content = "Signature Product"
    const rightHeading = createNewElement("heading")
    rightHeading.content = "Why Customers Buy"
    rightHeading.styles = { ...rightHeading.styles, fontSize: "22px", fontWeight: "bold" }
    const rightParagraph = createNewElement("paragraph")
    rightParagraph.content =
        "Use this section to explain materials, shipping speed, reviews, or your brand story."
    productHighlights.columnElements = [[leftHeading, leftCard], [rightHeading, rightParagraph]]
    catalog.sections.push({
        id: `section-${Date.now()}-catalog`,
        name: "Catalog Highlights",
        elements: [productHighlights],
    })

    const productGrid = createNewElement("product-grid")
    catalog.sections.push({
        id: `section-${Date.now()}-product-grid`,
        name: "Product Grid",
        elements: [productGrid],
    })

    const filters = createNewElement("product-filters")
    catalog.sections.push({
        id: `section-${Date.now()}-product-filters`,
        name: "Filterable Catalog",
        elements: [filters],
    })

    const recommendations = createNewElement("recommended-products")
    home.sections.push({
        id: `section-${Date.now()}-recommendations`,
        name: "Recommendations",
        elements: [recommendations],
    })

    const contact = createDefaultPage("Contact", "contact")
    contact.sections[0].elements[1].content =
        "Add support details, store policies, delivery zones, or a simple contact form."

    return [home, catalog, contact]
}

export function createStarterWebsitePayload(shopName = "Your Shop") {
    return {
        name: `${shopName} Storefront`,
        slug: normalizeSlugForWebsite(`${shopName}-storefront`),
        description: `A customizable ecommerce storefront for ${shopName}.`,
        templateKey: "ecommerce-starter",
        pages: createEcommercePages(shopName),
        theme: {
            brandTone: "ecommerce",
            accentColor: "#111827",
            surfaceColor: "#ffffff",
        },
        settings: {
            navigationStyle: "shop-first",
            currency: "USD",
            showFeaturedProducts: true,
            showNewsletter: true,
            enableStoreSearch: true,
            enableOauthLogin: true,
            enableRecommendations: true,
            enableProductFilters: true,
            enableCart: true,
            enableWishlist: true,
        },
        seo: {
            title: `${shopName} Online Store`,
            description: `Shop directly from ${shopName} with a customizable storefront and domain-ready publishing.`,
        },
        status: "draft",
        isPublished: false,
    }
}

function normalizeSlugForWebsite(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "shop-home"
}

export const DRAG_TYPE_KEY = "application/x-builder-drag"
