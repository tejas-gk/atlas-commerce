"use client"

import { useState } from "react"
import type {
    BuilderSection,
    BuilderElement,
    BuilderPage,
    ElementType,
    DragData,
} from "../../lib/builder-types"
import type { ProductRecord } from "../../lib/product-api"
import { ELEMENT_CATALOG, DRAG_TYPE_KEY } from "../../lib/builder-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Layers,
    Settings,
    Search,
    GripVertical,
    Heading1,
    Type,
    RectangleHorizontal,
    ImageIcon,
    Menu,
    List,
    Code,
    Minus,
    MoveVertical,
    Play,
    Columns3,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    MousePointerClick,
    ChevronRight,
    FileText,
    Plus,
    Trash2,
    Home,
    Pencil,
    Quote,
    Tag,
    Star,
    Share2,
    Images,
    LogIn,
    TextCursorInput,
    Mail,
    ChevronsUpDown,
    Table,
    BarChart3,
    Clock,
    LayoutGrid,
    MapPin,
    ExternalLink,
    Store,
    Sparkles,
    SlidersHorizontal,
    ShoppingBag,
    // shadcn icons
    CreditCard,
    PanelTop,
    UserCircle2,
    AlertCircle,
    AppWindow,
    MessageCircle,
    MousePointer2,
    Rows3,
    ListFilter,
    CheckSquare,
    ToggleLeft,
    GalleryHorizontal,
    Command as CommandIcon,
    CircleDot,
    MoreHorizontal,
    Info,
    Flag,
} from "lucide-react"

// ───── Icon map for catalog items ─────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Heading1,
    Type,
    RectangleHorizontal,
    ImageIcon,
    Menu,
    List,
    Code,
    Minus,
    MoveVertical,
    Play,
    Columns3,
    Quote,
    Tag,
    Star,
    Share2,
    Search,
    Images,
    LogIn,
    TextCursorInput,
    AlignLeft,
    Mail,
    ChevronsUpDown,
    Table,
    BarChart3,
    Clock,
    LayoutGrid,
    MapPin,
    ExternalLink,
    Store,
    Sparkles,
    SlidersHorizontal,
    ShoppingBag,
    // shadcn icons
    CreditCard,
    PanelTop,
    UserCircle2,
    AlertCircle,
    AppWindow,
    MessageCircle,
    MousePointer2,
    Rows3,
    ListFilter,
    CheckSquare,
    ToggleLeft,
    GalleryHorizontal,
    CommandIcon,
    CircleDot,
    ChevronRight,
    MoreHorizontal,
    Info,
    Flag,
}

// ───── Draggable Sidebar Element Card ─────
function DraggableCatalogItem({
    type,
    label,
    icon,
    description,
}: {
    type: ElementType
    label: string
    icon: string
    description: string
}) {
    const Icon = ICON_MAP[icon] || Type

    const handleDragStart = (e: React.DragEvent) => {
        const dragData: DragData = {
            sourceType: "sidebar",
            elementType: type,
        }
        e.dataTransfer.setData(DRAG_TYPE_KEY, JSON.stringify(dragData))
        e.dataTransfer.effectAllowed = "copy"

        const ghost = document.createElement("div")
        ghost.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      background: hsl(0 0% 100%); border: 1px solid hsl(0 0% 90%);
      border-radius: 8px; padding: 6px 12px;
      font-size: 12px; font-weight: 500; color: hsl(0 0% 10%);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      position: absolute; top: -9999px;
    `
        ghost.textContent = label
        document.body.appendChild(ghost)
        e.dataTransfer.setDragImage(ghost, 0, 0)
        setTimeout(() => document.body.removeChild(ghost), 0)
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-border/50 bg-background hover:bg-accent hover:border-border cursor-grab active:cursor-grabbing transition-all duration-150 group"
            title={`Drag to add ${label}`}
        >
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-accent-foreground/5 transition-colors">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-none mb-0.5">
                    {label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none">
                    {description}
                </p>
            </div>
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
    )
}

// ───── Layer Tree ─────
function LayerTree({
    sections,
    selectedElementId,
    selectedSectionId,
    onSelectElement,
    onSelectSection,
}: {
    sections: BuilderSection[]
    selectedElementId: string | null
    selectedSectionId: string | null
    onSelectElement: (elementId: string, sectionId: string) => void
    onSelectSection: (sectionId: string) => void
}) {
    return (
        <div className="space-y-0.5">
            {sections.map((section) => (
                <div key={section.id}>
                    <button
                        className={`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${selectedSectionId === section.id && !selectedElementId
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-foreground hover:bg-muted"
                            }`}
                        onClick={() => onSelectSection(section.id)}
                    >
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span>{section.name}</span>
                        <Badge
                            variant="secondary"
                            className="text-[9px] h-3.5 px-1 font-normal ml-auto"
                        >
                            {section.elements.length}
                        </Badge>
                    </button>
                    <div className="ml-4 border-l border-border/50 pl-1 space-y-0.5">
                        {section.elements.map((el) => (
                            <div key={el.id}>
                                <button
                                    className={`w-full text-left text-[11px] px-2 py-1 rounded-md truncate flex items-center gap-1.5 transition-colors ${selectedElementId === el.id
                                        ? "bg-blue-100 text-blue-700 font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                    onClick={() => onSelectElement(el.id, section.id)}
                                >
                                    <span className="capitalize shrink-0">{el.type}</span>
                                    {el.content && (
                                        <span className="opacity-50 truncate">
                                            {"- "}
                                            {el.content.substring(0, 18)}
                                        </span>
                                    )}
                                </button>
                                {el.type === "columns" && el.columnElements && (
                                    <div className="ml-3 border-l border-border/30 pl-1 space-y-0.5">
                                        {el.columnElements.map((col, ci) =>
                                            col.map((child) => (
                                                <button
                                                    key={child.id}
                                                    className={`w-full text-left text-[10px] px-2 py-0.5 rounded-md truncate transition-colors ${selectedElementId === child.id
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        }`}
                                                    onClick={() =>
                                                        onSelectElement(child.id, section.id)
                                                    }
                                                >
                                                    Col {ci + 1}: {child.type}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ───── Pages Panel ─────
function PagesPanel({
    pages,
    activePageId,
    onSelectPage,
    onAddPage,
    onDeletePage,
    onRenamePage,
}: {
    pages: BuilderPage[]
    activePageId: string
    onSelectPage: (pageId: string) => void
    onAddPage: () => void
    onDeletePage: (pageId: string) => void
    onRenamePage: (pageId: string, name: string) => void
}) {
    const [editingPageId, setEditingPageId] = useState<string | null>(null)
    const [editName, setEditName] = useState("")

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Site Pages
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] gap-1 px-2"
                    onClick={onAddPage}
                >
                    <Plus className="h-3 w-3" />
                    Add Page
                </Button>
            </div>

            <div className="space-y-1">
                {pages.map((page) => (
                    <div
                        key={page.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all cursor-pointer group ${activePageId === page.id
                            ? "bg-blue-50 border border-blue-200 text-blue-800"
                            : "border border-transparent hover:bg-muted hover:border-border"
                            }`}
                        onClick={() => onSelectPage(page.id)}
                    >
                        <div
                            className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${activePageId === page.id
                                ? "bg-blue-100"
                                : "bg-muted"
                                }`}
                        >
                            {page.isHome ? (
                                <Home className="h-3.5 w-3.5" />
                            ) : (
                                <FileText className="h-3.5 w-3.5" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingPageId === page.id ? (
                                <input
                                    autoFocus
                                    className="text-xs font-medium bg-background border border-border rounded px-1.5 py-0.5 w-full outline-none focus:border-blue-400"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onBlur={() => {
                                        if (editName.trim()) onRenamePage(page.id, editName.trim())
                                        setEditingPageId(null)
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (editName.trim()) onRenamePage(page.id, editName.trim())
                                            setEditingPageId(null)
                                        }
                                        if (e.key === "Escape") setEditingPageId(null)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <p className="text-xs font-medium leading-none mb-0.5 truncate">
                                        {page.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground leading-none truncate">
                                        /{page.slug}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingPageId(page.id)
                                    setEditName(page.name)
                                }}
                                title="Rename page"
                            >
                                <Pencil className="h-3 w-3" />
                            </button>
                            {!page.isHome && (
                                <button
                                    className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDeletePage(page.id)
                                    }}
                                    title="Delete page"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-muted/50 rounded-lg px-3 py-2 text-[10px] text-muted-foreground leading-relaxed">
                Each page has its own sections and elements. Click a page to switch to editing it.
            </div>
        </div>
    )
}

// ───── Properties Panel (right sidebar) ─────
export function PropertiesPanel({
    element,
    products,
    onUpdate,
    onDelete,
    onDuplicate,
}: {
    element: BuilderElement | null
    products: ProductRecord[]
    onUpdate: (id: string, updates: Partial<BuilderElement>) => void
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
}) {
    if (!element) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-muted/20 px-6 text-center">
                <MousePointerClick className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                    Select an element
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    Click on an element in the canvas to edit its properties
                </p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-auto bg-muted/20">
            {/* Header */}
            <div className="p-3 border-b bg-background flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h3 className="text-xs font-semibold">Properties</h3>
                    <p className="text-[10px] text-muted-foreground capitalize">
                        {element.type} element
                    </p>
                </div>
                <Badge
                    variant="secondary"
                    className="text-[10px] h-4 px-1.5 bg-emerald-100 text-emerald-700 border-emerald-200"
                >
                    Auto-save
                </Badge>
            </div>

            <div className="p-3 space-y-5">
                {/* Content */}
                <div>
                    <h3 className="text-xs font-semibold mb-2">Content</h3>
                    <div className="space-y-2">
                        {element.type !== "divider" && element.type !== "spacer" && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    {element.type === "image" || element.type === "video" || element.type === "embed" || element.type === "map"
                                        ? "Source URL"
                                        : element.type === "countdown"
                                            ? "Target Date (ISO)"
                                            : element.type === "progress"
                                                ? "Progress Value (0-100)"
                                                : element.type === "gallery"
                                                    ? "Image URLs (comma-separated)"
                                                    : element.type === "table"
                                                        ? "CSV Data"
                                                        : element.type === "accordion"
                                                            ? "Question|Answer (one per line)"
                                                            : element.type === "social-links"
                                                                ? "Social names (comma-separated)"
                                                                : element.type === "icon"
                                                                    ? "Icon name"
                                                                    : element.type === "card-element"
                                                                        ? "Title|Description|Footer"
                                                                        : element.type === "tabs-element"
                                                                            ? "Tab Label|Content (one per line)"
                                                                            : element.type === "avatar-element"
                                                                                ? "Name|Initials|Image URL"
                                                                                : element.type === "alert-element"
                                                                                    ? "Title|Description"
                                                                                    : element.type === "dialog-element"
                                                                                        ? "Button Label|Title|Description"
                                                                                        : element.type === "popover-element"
                                                                                            ? "Button Label|Title|Description"
                                                                                            : element.type === "collapsible-element"
                                                                                                ? "Trigger|Hidden content"
                                                                                                : element.type === "hover-card-element"
                                                                                                    ? "Trigger|Name|Description"
                                                                                                    : element.type === "skeleton-element"
                                                                                                        ? "Row count (1-6)"
                                                                                                        : element.type === "select-element"
                                                                                                            ? "Placeholder|Option 1,Option 2,..."
                                                                                                            : element.type === "checkbox-element"
                                                                                                                ? "Label text"
                                                                                                                : element.type === "switch-element"
                                                                                                                    ? "Label text"
                                                                                                                    : element.type === "slider-element"
                                                                                                                        ? "Default|Min|Max"
                                                                                                                        : element.type === "carousel-element"
                                                                                                                            ? "Title|Content (one per line)"
                                                                                                                            : element.type === "command-element"
                                                                                                                                ? "Placeholder (line 1), then list items"
                                                                                                                                : element.type === "radio-group-element"
                                                                                                                                    ? "Default|Option 1,Option 2,..."
                                                                                                                                    : element.type === "breadcrumb-element"
                                                                                                                                        ? "Crumb 1,Crumb 2,... (comma-separated)"
                                                                                                                                        : element.type === "pagination-element"
                                                                                                                                            ? "Current page|Total pages"
                                                                                                                                            : element.type === "callout"
                                                                                                                                                ? "type (info/warning/error)|Title|Description"
                                                                                                                                                : element.type === "ribbon"
                                                                                                                                                    ? "Label|Subtitle"
                                                                                                                                                    : "Text Content"}
                                </Label>
                                <Textarea
                                    value={element.content}
                                    onChange={(e) =>
                                        onUpdate(element.id, { content: e.target.value })
                                    }
                                    className="text-xs min-h-[60px]"
                                />
                            </div>
                        )}

                        {/* Form-specific fields */}
                        {(element.type === "form-input" || element.type === "form-textarea" ||
                            element.type === "select-element" || element.type === "slider-element" ||
                            element.type === "radio-group-element") && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Label</Label>
                                        <Input
                                            value={element.label || ""}
                                            onChange={(e) =>
                                                onUpdate(element.id, { label: e.target.value })
                                            }
                                            className="h-7 text-xs"
                                            placeholder="Field label"
                                        />
                                    </div>
                                    {(element.type === "form-input" || element.type === "form-textarea") && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Placeholder</Label>
                                            <Input
                                                value={element.placeholder || ""}
                                                onChange={(e) =>
                                                    onUpdate(element.id, { placeholder: e.target.value })
                                                }
                                                className="h-7 text-xs"
                                                placeholder="Placeholder text"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                        {(
                            element.type === "product-card" ||
                            element.type === "product-grid" ||
                            element.type === "recommended-products" ||
                            element.type === "product-filters"
                        ) && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Product Source</Label>
                                        <select
                                            value={element.dataSource || "shop-products"}
                                            onChange={(e) =>
                                                onUpdate(element.id, {
                                                    dataSource: e.target.value as "manual" | "shop-products",
                                                })
                                            }
                                            className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                        >
                                            <option value="shop-products">Sync from active shop</option>
                                            <option value="manual">Manual content</option>
                                        </select>
                                    </div>

                                    {element.type === "product-card" && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Linked Product</Label>
                                            <select
                                                value={element.productId || ""}
                                                onChange={(e) =>
                                                    onUpdate(element.id, {
                                                        productId: e.target.value || null,
                                                    })
                                                }
                                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                                            >
                                                <option value="">Auto pick first product</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {(element.type === "product-grid" ||
                                        element.type === "recommended-products" ||
                                        element.type === "product-filters") && (
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">Products to Show</Label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={24}
                                                    value={String(element.productLimit || 4)}
                                                    onChange={(e) =>
                                                        onUpdate(element.id, {
                                                            productLimit: Math.max(1, Number(e.target.value) || 4),
                                                        })
                                                    }
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        )}
                                </>
                            )}

                        {/* Action links */}
                        {["button", "search-bar", "product-card", "oauth-login", "image"].includes(element.type) && (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Link URL</Label>
                                    <Input
                                        value={element.href || "#"}
                                        onChange={(e) =>
                                            onUpdate(element.id, { href: e.target.value })
                                        }
                                        className="h-7 text-xs"
                                        placeholder={
                                            element.type === "search-bar"
                                                ? "/products?query={query}"
                                                : element.type === "product-card"
                                                    ? "/product/{slug}"
                                                    : "https://..."
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Open in new tab</Label>
                                    <Switch
                                        checked={Boolean(element.openInNewTab)}
                                        onCheckedChange={(checked) =>
                                            onUpdate(element.id, { openInNewTab: checked })
                                        }
                                    />
                                </div>
                            </>
                        )}

                        {["product-card", "hero-slider", "gallery", "image"].includes(element.type) && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">
                                    {element.type === "hero-slider"
                                        ? "Slide Media URLs"
                                        : element.type === "gallery"
                                            ? "Gallery Media URLs"
                                            : "Media URLs"}
                                </Label>
                                <Textarea
                                    value={(element.mediaItems || []).join("\n")}
                                    onChange={(e) =>
                                        onUpdate(element.id, {
                                            mediaItems: e.target.value
                                                .split("\n")
                                                .map((item) => item.trim())
                                                .filter(Boolean),
                                        })
                                    }
                                    className="text-xs min-h-[72px]"
                                    placeholder="One image URL per line"
                                />
                            </div>
                        )}

                        {/* Icon selector */}
                        {element.type === "icon" && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Icon</Label>
                                <div className="grid grid-cols-5 gap-1">
                                    {["star", "heart", "check", "arrow", "mail", "phone", "home", "music", "sun", "moon"].map((name) => {
                                        const iconMap: Record<string, string> = { star: "\u2605", heart: "\u2665", check: "\u2713", arrow: "\u2192", mail: "\u2709", phone: "\u260E", home: "\u2302", music: "\u266B", sun: "\u2600", moon: "\u263E" }
                                        return (
                                            <button
                                                key={name}
                                                className={`h-8 w-full rounded text-lg flex items-center justify-center transition-colors ${element.content === name
                                                    ? "bg-foreground text-background"
                                                    : "bg-muted hover:bg-accent"
                                                    }`}
                                                onClick={() => onUpdate(element.id, { content: name })}
                                            >
                                                {iconMap[name]}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label className="text-xs">HTML ID</Label>
                            <Input
                                placeholder="Enter ID"
                                value={element.htmlId}
                                onChange={(e) =>
                                    onUpdate(element.id, { htmlId: e.target.value })
                                }
                                className="h-7 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">CSS Classes</Label>
                            <Input
                                placeholder="Enter classes"
                                value={element.cssClasses}
                                onChange={(e) =>
                                    onUpdate(element.id, { cssClasses: e.target.value })
                                }
                                className="h-7 text-xs"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Typography */}
                {element.type !== "image" &&
                    element.type !== "divider" &&
                    element.type !== "spacer" &&
                    element.type !== "video" &&
                    element.type !== "embed" &&
                    element.type !== "map" &&
                    element.type !== "gallery" && (
                        <>
                            <div>
                                <h3 className="text-xs font-semibold mb-2">Typography</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Font Size</Label>
                                        <div className="flex items-center gap-2">
                                            <Slider
                                                value={[
                                                    Number.parseInt(element.styles.fontSize) || 16,
                                                ]}
                                                max={72}
                                                min={8}
                                                step={1}
                                                className="flex-1"
                                                onValueChange={(value) =>
                                                    onUpdate(element.id, {
                                                        styles: {
                                                            ...element.styles,
                                                            fontSize: `${value[0]}px`,
                                                        },
                                                    })
                                                }
                                            />
                                            <span className="w-10 text-center text-xs tabular-nums">
                                                {Number.parseInt(element.styles.fontSize) || 16}px
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant={
                                                element.styles.fontWeight === "bold"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        fontWeight:
                                                            element.styles.fontWeight === "bold"
                                                                ? "normal"
                                                                : "bold",
                                                    },
                                                })
                                            }
                                        >
                                            <Bold className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant={
                                                element.styles.fontStyle === "italic"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        fontStyle:
                                                            element.styles.fontStyle === "italic"
                                                                ? "normal"
                                                                : "italic",
                                                    },
                                                })
                                            }
                                        >
                                            <Italic className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant={
                                                element.styles.textDecoration === "underline"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        textDecoration:
                                                            element.styles.textDecoration === "underline"
                                                                ? "none"
                                                                : "underline",
                                                    },
                                                })
                                            }
                                        >
                                            <Underline className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                        </>
                    )}

                {/* Layout */}
                <div>
                    <h3 className="text-xs font-semibold mb-2">Layout</h3>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Width</Label>
                            <Input
                                value={element.styles.width}
                                onChange={(e) =>
                                    onUpdate(element.id, {
                                        styles: { ...element.styles, width: e.target.value },
                                    })
                                }
                                className="h-7 text-xs"
                                placeholder="auto, 100%, 300px"
                            />
                        </div>
                        {(element.type === "spacer" || element.type === "video" || element.type === "embed" || element.type === "map" || element.type === "form-textarea") && (
                            <div className="space-y-1.5">
                                <Label className="text-xs">Height</Label>
                                <Input
                                    value={element.styles.height || ""}
                                    onChange={(e) =>
                                        onUpdate(element.id, {
                                            styles: { ...element.styles, height: e.target.value },
                                        })
                                    }
                                    className="h-7 text-xs"
                                    placeholder="40px"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Alignment</Label>
                            <div className="flex gap-1">
                                {(["left", "center", "right"] as const).map((align) => (
                                    <Button
                                        key={align}
                                        variant={
                                            element.styles.alignment === align
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        className="flex-1 h-7"
                                        onClick={() =>
                                            onUpdate(element.id, {
                                                styles: { ...element.styles, alignment: align },
                                            })
                                        }
                                    >
                                        {align === "left" && <AlignLeft className="h-3.5 w-3.5" />}
                                        {align === "center" && (
                                            <AlignCenter className="h-3.5 w-3.5" />
                                        )}
                                        {align === "right" && (
                                            <AlignRight className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Margin */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Margin</Label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {(
                                    [
                                        { label: "T", key: "top" },
                                        { label: "R", key: "right" },
                                        { label: "B", key: "bottom" },
                                        { label: "L", key: "left" },
                                    ] as const
                                ).map(({ label, key }) => (
                                    <div key={label} className="space-y-0.5">
                                        <span className="text-[10px] text-muted-foreground">
                                            {label}
                                        </span>
                                        <Input
                                            value={element.styles.margin[key]}
                                            onChange={(e) =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        margin: {
                                                            ...element.styles.margin,
                                                            [key]: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Padding */}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Padding</Label>
                            <div className="grid grid-cols-4 gap-1.5">
                                {(
                                    [
                                        { label: "T", key: "top" },
                                        { label: "R", key: "right" },
                                        { label: "B", key: "bottom" },
                                        { label: "L", key: "left" },
                                    ] as const
                                ).map(({ label, key }) => (
                                    <div key={label} className="space-y-0.5">
                                        <span className="text-[10px] text-muted-foreground">
                                            {label}
                                        </span>
                                        <Input
                                            value={element.styles.padding[key]}
                                            onChange={(e) =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        padding: {
                                                            ...element.styles.padding,
                                                            [key]: e.target.value,
                                                        },
                                                    },
                                                })
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Colors */}
                <div>
                    <h3 className="text-xs font-semibold mb-2">Colors</h3>
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Background</Label>
                            <div className="flex gap-1.5 items-center">
                                <input
                                    type="color"
                                    value={
                                        element.styles.backgroundColor === "transparent"
                                            ? "#ffffff"
                                            : element.styles.backgroundColor
                                    }
                                    onChange={(e) =>
                                        onUpdate(element.id, {
                                            styles: {
                                                ...element.styles,
                                                backgroundColor: e.target.value,
                                            },
                                        })
                                    }
                                    className="h-7 w-7 rounded cursor-pointer border border-border"
                                />
                                <Input
                                    type="text"
                                    value={element.styles.backgroundColor}
                                    onChange={(e) =>
                                        onUpdate(element.id, {
                                            styles: {
                                                ...element.styles,
                                                backgroundColor: e.target.value,
                                            },
                                        })
                                    }
                                    className="flex-1 h-7 text-xs"
                                />
                            </div>
                        </div>
                        {element.type !== "image" &&
                            element.type !== "divider" &&
                            element.type !== "spacer" && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Text Color</Label>
                                    <div className="flex gap-1.5 items-center">
                                        <input
                                            type="color"
                                            value={element.styles.color}
                                            onChange={(e) =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        color: e.target.value,
                                                    },
                                                })
                                            }
                                            className="h-7 w-7 rounded cursor-pointer border border-border"
                                        />
                                        <Input
                                            type="text"
                                            value={element.styles.color}
                                            onChange={(e) =>
                                                onUpdate(element.id, {
                                                    styles: {
                                                        ...element.styles,
                                                        color: e.target.value,
                                                    },
                                                })
                                            }
                                            className="flex-1 h-7 text-xs"
                                        />
                                    </div>
                                </div>
                            )}
                        <div className="space-y-1.5">
                            <Label className="text-xs">Border Radius</Label>
                            <Input
                                value={element.styles.borderRadius || ""}
                                onChange={(e) =>
                                    onUpdate(element.id, {
                                        styles: {
                                            ...element.styles,
                                            borderRadius: e.target.value,
                                        },
                                    })
                                }
                                className="h-7 text-xs"
                                placeholder="6px"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Border</Label>
                            <Input
                                value={element.styles.border || ""}
                                onChange={(e) =>
                                    onUpdate(element.id, {
                                        styles: {
                                            ...element.styles,
                                            border: e.target.value,
                                        },
                                    })
                                }
                                className="h-7 text-xs"
                                placeholder="1px solid #ccc"
                            />
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Columns specific */}
                {element.type === "columns" && (
                    <>
                        <div>
                            <h3 className="text-xs font-semibold mb-2">Column Settings</h3>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Number of Columns</Label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <Button
                                            key={n}
                                            variant={
                                                (element.columnCount || 2) === n
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="flex-1 h-7 text-xs"
                                            onClick={() =>
                                                onUpdate(element.id, { columnCount: n } as Partial<BuilderElement>)
                                            }
                                        >
                                            {n}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Separator />
                    </>
                )}

                {/* Actions */}
                <div>
                    <h3 className="text-xs font-semibold mb-2">Actions</h3>
                    <div className="space-y-1.5">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-8 text-xs"
                            onClick={() => onDuplicate(element.id)}
                        >
                            Duplicate Element
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-8 text-xs text-destructive hover:text-destructive"
                            onClick={() => onDelete(element.id)}
                        >
                            Delete Element
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ───── Category group renderer ─────
function CatalogCategory({
    title,
    items,
}: {
    title: string
    items: typeof ELEMENT_CATALOG
}) {
    if (items.length === 0) return null
    return (
        <div>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {title}
            </div>
            <div className="space-y-1.5">
                {items.map((item) => (
                    <DraggableCatalogItem key={item.type} {...item} />
                ))}
            </div>
        </div>
    )
}

// ───── Main Left Sidebar ─────
export function BuilderSidebar({
    sections,
    pages,
    activePageId,
    selectedElementId,
    selectedSectionId,
    onSelectElement,
    onSelectSection,
    onSelectPage,
    onAddPage,
    onDeletePage,
    onRenamePage,
}: {
    sections: BuilderSection[]
    pages: BuilderPage[]
    activePageId: string
    selectedElementId: string | null
    selectedSectionId: string | null
    onSelectElement: (elementId: string, sectionId: string) => void
    onSelectSection: (sectionId: string) => void
    onSelectPage: (pageId: string) => void
    onAddPage: () => void
    onDeletePage: (pageId: string) => void
    onRenamePage: (pageId: string, name: string) => void
}) {
    const [activeTab, setActiveTab] = useState("elements")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredCatalog = searchQuery
        ? ELEMENT_CATALOG.filter(
            (item) =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ELEMENT_CATALOG

    const categories = [
        { key: "layout", title: "Layout" },
        { key: "basic", title: "Basic" },
        { key: "media", title: "Media" },
        { key: "forms", title: "Forms" },
        { key: "interactive", title: "Interactive" },
        { key: "advanced", title: "Advanced" },
        { key: "shadcn", title: "shadcn/ui Components" },
    ] as const

    return (
        <div className="w-[280px] border-r bg-muted/20 shrink-0 flex flex-col">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
            >
                <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-transparent h-10 shrink-0">
                    <TabsTrigger
                        value="elements"
                        className="text-xs gap-1 data-[state=active]:bg-background rounded-none"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </TabsTrigger>
                    <TabsTrigger
                        value="pages"
                        className="text-xs gap-1 data-[state=active]:bg-background rounded-none"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        Pages
                    </TabsTrigger>
                    <TabsTrigger
                        value="layers"
                        className="text-xs gap-1 data-[state=active]:bg-background rounded-none"
                    >
                        <Layers className="h-3.5 w-3.5" />
                        Layers
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="text-xs gap-1 data-[state=active]:bg-background rounded-none"
                    >
                        <Settings className="h-3.5 w-3.5" />
                        Site
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto">
                    {/* ── Elements / Add Tab ── */}
                    <TabsContent value="elements" className="mt-0 p-3">
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search elements..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 text-xs pl-8"
                                />
                            </div>

                            {/* Drag hint */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[11px] text-blue-700 leading-relaxed">
                                Drag any element below onto the canvas to add it to your page
                            </div>

                            {/* Categories */}
                            {categories.map(({ key, title }) => (
                                <CatalogCategory
                                    key={key}
                                    title={title}
                                    items={filteredCatalog.filter((item) => item.category === key)}
                                />
                            ))}
                        </div>
                    </TabsContent>

                    {/* ── Pages Tab ── */}
                    <TabsContent value="pages" className="mt-0 p-3">
                        <PagesPanel
                            pages={pages}
                            activePageId={activePageId}
                            onSelectPage={onSelectPage}
                            onAddPage={onAddPage}
                            onDeletePage={onDeletePage}
                            onRenamePage={onRenamePage}
                        />
                    </TabsContent>

                    {/* ── Layers Tab ── */}
                    <TabsContent value="layers" className="mt-0 p-3">
                        <div className="space-y-3">
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Page Structure
                            </div>
                            <LayerTree
                                sections={sections}
                                selectedElementId={selectedElementId}
                                selectedSectionId={selectedSectionId}
                                onSelectElement={onSelectElement}
                                onSelectSection={onSelectSection}
                            />
                        </div>
                    </TabsContent>

                    {/* ── Settings Tab ── */}
                    <TabsContent value="settings" className="mt-0 p-3">
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-xs font-semibold mb-2">Site Settings</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Site Name</Label>
                                        <Input
                                            placeholder="My Website"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Meta Description</Label>
                                        <Input
                                            placeholder="A great website"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Enable SEO</Label>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Responsive Design</Label>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-xs font-semibold mb-2">Publishing</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Domain</Label>
                                        <Input
                                            placeholder="yourdomain.com"
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                    <Button className="w-full h-8 text-xs">
                                        Publish Website
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-xs font-semibold mb-2">Custom Code</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Custom CSS</Label>
                                        <Textarea
                                            className="h-20 font-mono text-xs"
                                            placeholder="/* Custom CSS */"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Custom JavaScript</Label>
                                        <Textarea
                                            className="h-20 font-mono text-xs"
                                            placeholder="// Custom JavaScript"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
