import type { BuilderPage } from "./builder-types"
import { createDefaultPage, createEcommercePages, createNewElement, createStarterWebsitePayload } from "./builder-types"

export interface WebsiteTemplateDefinition {
  key: string
  name: string
  category: "ecommerce" | "fashion" | "electronics" | "beauty" | "home" | "food" | "drops" | "editorial"
  thumbnail: string
  summary: string
  description: string
  accentColor: string
  surfaceColor: string
  tone: string
}

export const WEBSITE_TEMPLATES: WebsiteTemplateDefinition[] = [
  {
    key: "ecommerce-starter",
    name: "Commerce Starter",
    category: "ecommerce",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Balanced starter for general online stores.",
    description: "A flexible storefront with hero media, recommendations, filters, and a product-first layout.",
    accentColor: "#111827",
    surfaceColor: "#ffffff",
    tone: "clean",
  },
  {
    key: "fashion-editorial",
    name: "Fashion Editorial",
    category: "fashion",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Bold lookbook-style storefront for apparel and luxury drops.",
    description: "Designed for collections, story-led hero sections, and immersive campaign visuals.",
    accentColor: "#7c2d12",
    surfaceColor: "#f8f5f0",
    tone: "editorial",
  },
  {
    key: "electronics-grid",
    name: "Electronics Grid",
    category: "electronics",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Spec-heavy storefront with comparison-friendly sections.",
    description: "Works well for gadgets, accessories, and feature-rich product catalogs.",
    accentColor: "#0f172a",
    surfaceColor: "#f8fafc",
    tone: "technical",
  },
  {
    key: "beauty-brand",
    name: "Beauty Brand",
    category: "beauty",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Soft visual merchandising for skincare and cosmetics.",
    description: "Combines recommendation shelves, ingredient storytelling, and easy category browsing.",
    accentColor: "#be185d",
    surfaceColor: "#fff7fb",
    tone: "soft-luxury",
  },
  {
    key: "home-living",
    name: "Home Living",
    category: "home",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Warm, spacious storefront for decor and furniture.",
    description: "Emphasizes room-based collections, bundles, and editorial storytelling.",
    accentColor: "#365314",
    surfaceColor: "#fefce8",
    tone: "warm",
  },
  {
    key: "food-delivery",
    name: "Food Delivery",
    category: "food",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Fast-commerce layout for groceries, snacks, and local delivery.",
    description: "Prioritizes search, category scanning, and quick product discovery.",
    accentColor: "#0c831f",
    surfaceColor: "#f7fff7",
    tone: "fast",
  },
  {
    key: "drops-launch",
    name: "Drops Launch",
    category: "drops",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "High-energy launch template for limited releases.",
    description: "Built around countdowns, featured drops, hero sliders, and urgency-driven CTAs.",
    accentColor: "#7f1d1d",
    surfaceColor: "#fff7ed",
    tone: "hype",
  },
  {
    key: "editorial-market",
    name: "Editorial Market",
    category: "editorial",
    thumbnail: "/placeholder.svg?height=200&width=300",
    summary: "Magazine-like storefront for curated marketplaces.",
    description: "Mixes stories, featured makers, and shoppable collections into one brand-heavy homepage.",
    accentColor: "#1d4ed8",
    surfaceColor: "#f8fafc",
    tone: "curated",
  },
]

function buildTemplatePages(templateKey: string, shopName: string): BuilderPage[] {
  const pages = createEcommercePages(shopName)
  const home = pages[0]
  const shop = pages.find((page) => page.slug === "shop") || pages[1]

  switch (templateKey) {
    case "fashion-editorial": {
      home.sections[0].elements[1].content = "Craft a campaign-led shopping experience with cinematic visuals and curated collections."
      const spotlight = createNewElement("columns")
      const story = createNewElement("heading")
      story.content = "Campaign Story"
      const body = createNewElement("paragraph")
      body.content = "Blend lookbook imagery, featured pieces, and collection drops in one polished storefront."
      const login = createNewElement("oauth-login")
      login.content = "Join the private drop"
      spotlight.columnElements = [[story, body], [login]]
      home.sections.push({
        id: `section-${Date.now()}-fashion-story`,
        name: "Campaign Story",
        elements: [spotlight],
      })
      break
    }
    case "electronics-grid": {
      const specs = createNewElement("product-filters")
      specs.content = "Compare and Filter"
      shop.sections.unshift({
        id: `section-${Date.now()}-electronics-filters`,
        name: "Product Discovery",
        elements: [specs],
      })
      break
    }
    case "food-delivery": {
      home.sections[0].elements[0].content = `${shopName} delivered in minutes`
      home.sections[0].elements[1].content = "Lead with search, categories, and fast-moving shelves for instant ordering."
      break
    }
    case "drops-launch": {
      const countdown = createNewElement("countdown")
      countdown.content = "2026-12-31T00:00:00"
      home.sections[0].elements.splice(1, 0, countdown)
      break
    }
    case "editorial-market": {
      const journal = createDefaultPage("Journal", "journal")
      journal.sections[0].elements[0].content = "Stories behind the products"
      journal.sections[0].elements[1].content = "Use editorial pages to support discovery, brand trust, and conversion."
      pages.push(journal)
      break
    }
    default:
      break
  }

  return pages
}

export function getTemplateDefinition(templateKey?: string) {
  return WEBSITE_TEMPLATES.find((template) => template.key === templateKey) || WEBSITE_TEMPLATES[0]
}

export function createWebsitePayloadFromTemplate(shopName = "Your Shop", templateKey?: string) {
  const template = getTemplateDefinition(templateKey)
  const starter = createStarterWebsitePayload(shopName)

  return {
    ...starter,
    name: `${shopName} ${template.name}`,
    templateKey: template.key,
    description: template.description,
    pages: buildTemplatePages(template.key, shopName),
    theme: {
      brandTone: template.tone,
      accentColor: template.accentColor,
      surfaceColor: template.surfaceColor,
    },
    seo: {
      title: `${shopName} | ${template.name}`,
      description: template.description,
    },
  }
}
