// ───── Element Types ─────
export type ElementType =
    | "heading"
    | "paragraph"
    | "image"
    | "button"
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
    | "shopping-cart"


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
    category: "layout" | "basic" | "media" | "advanced" | "forms" | "interactive"
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
    { type: "navigation", label: "Nav Links", icon: "Menu", category: "basic", description: "Navigation menu" },
    { type: "list", label: "List", icon: "List", category: "basic", description: "Bulleted list" },
    { type: "quote", label: "Quote", icon: "Quote", category: "basic", description: "Block quote" },
    { type: "badge-element", label: "Badge", icon: "Tag", category: "basic", description: "Label badge" },
    { type: "icon", label: "Icon", icon: "Star", category: "basic", description: "Decorative icon" },

    // Media
    { type: "image", label: "Image", icon: "ImageIcon", category: "media", description: "Picture element" },
    { type: "video", label: "Video", icon: "Play", category: "media", description: "Embed video" },
    { type: "gallery", label: "Gallery", icon: "LayoutGrid", category: "media", description: "Image gallery" },
    { type: "map", label: "Map", icon: "MapPin", category: "media", description: "Google Map" },
    { type: "embed", label: "Embed", icon: "ExternalLink", category: "media", description: "External embed" },
    { type: "social-links", label: "Social Icons", icon: "Share2", category: "media", description: "Social media links" },

    // e-Commerce
    { type: "product-card", label: "Product Card", icon: "ShoppingCart", category: "advanced", description: "Individual product display" },
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
        case "image":
            return "/placeholder.svg?height=200&width=400"
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
        case "image":
            return { ...base, width: "100%" }
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
