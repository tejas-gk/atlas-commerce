"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { BuilderElement, BuilderSection, BuilderPage as PageType } from "@/lib/builder-types"
import { createDefaultPage, createStarterWebsitePayload } from "@/lib/builder-types"
import { BuilderCanvas } from "@/components/builder/builder-canvas"
import { BuilderSidebar, PropertiesPanel } from "@/components/builder/builder-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/auth-api"
import { websiteApi, type WebsiteDomainRecord, type WebsiteRecord } from "@/lib/website-api"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Undo2,
  Redo2,
  Download,
  CheckCircle2,
  FileText,
  Globe,
} from "lucide-react"

// ───── Helper: find element by id across all sections ─────
function findElementById(
  sections: BuilderSection[],
  id: string
): BuilderElement | null {
  for (const section of sections) {
    for (const el of section.elements) {
      if (el.id === id) return el
      if (el.type === "columns" && el.columnElements) {
        for (const col of el.columnElements) {
          for (const child of col) {
            if (child.id === id) return child
          }
        }
      }
    }
  }
  return null
}

// ───── Default pages ─────
function getDefaultPages(): PageType[] {
  return [
    createDefaultPage("Home", "", true),
    createDefaultPage("About", "about"),
    createDefaultPage("Contact", "contact"),
  ]
}

// ───── Main Builder Page ─────
export default function BuilderPageComponent({
  params,
}: {
  params: { id: string }
}) {
  // ─── Multi-page state ───
  const [pages, setPages] = useState<PageType[]>(getDefaultPages)
  const [activePageId, setActivePageId] = useState<string>(() => getDefaultPages()[0].id)
  const [website, setWebsite] = useState<WebsiteRecord | null>(null)
  const [activeShopId, setActiveShopId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [domainName, setDomainName] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDomainPending, setIsDomainPending] = useState(false)

  // Derived: current page and its sections
  const activePage = pages.find((p) => p.id === activePageId) || pages[0]
  const sections = activePage?.sections || []

  // ─── Selection state ───
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [editingElementId, setEditingElementId] = useState<string | null>(null)

  // ─── UI state ───
  const [activeDevice, setActiveDevice] = useState("desktop")
  const [showPreview, setShowPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  // ─── History (refs only, no useEffect) ───
  const historyRef = useRef<string[]>([JSON.stringify(getDefaultPages())])
  const historyIndexRef = useRef(0)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestPagesRef = useRef(pages)
  latestPagesRef.current = pages

  // Computed undo/redo state
  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1
  const [, setRenderKey] = useState(0)

  useEffect(() => {
    const loadWebsite = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (params.id === "new") {
          const starter = createStarterWebsitePayload()
          const starterPages = starter.pages as PageType[]
          setPages(starterPages)
          setActivePageId(starterPages[0]?.id || "")
          historyRef.current = [JSON.stringify(starterPages)]
          historyIndexRef.current = 0
          return
        }

        const response = await websiteApi.get(params.id)
        setWebsite(response.website)
        const nextPages = Array.isArray(response.website.pages)
          ? (response.website.pages as PageType[])
          : getDefaultPages()
        setPages(nextPages)
        setActivePageId(nextPages[0]?.id || "")
        historyRef.current = [JSON.stringify(nextPages)]
        historyIndexRef.current = 0
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load website"
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadWebsite()
  }, [params.id])

  // ─── Update pages with debounced history + auto-save indicator ───
  const updatePages = useCallback((updater: (prev: PageType[]) => PageType[]) => {
    setPages((prev) => updater(prev))

    if (historyTimerRef.current) clearTimeout(historyTimerRef.current)
    historyTimerRef.current = setTimeout(() => {
      const snap = JSON.stringify(latestPagesRef.current)
      const lastSnap = historyRef.current[historyIndexRef.current]
      if (snap !== lastSnap) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
        historyRef.current.push(snap)
        if (historyRef.current.length > 50) historyRef.current.shift()
        historyIndexRef.current = historyRef.current.length - 1
      }
    }, 400)

    setSaveStatus("saving")
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 800)
  }, [])

  // Helper: update just the active page's sections
  const updateSections = useCallback(
    (updater: (prev: BuilderSection[]) => BuilderSection[]) => {
      updatePages((prevPages) =>
        prevPages.map((p) =>
          p.id === activePageId
            ? { ...p, sections: updater(p.sections) }
            : p
        )
      )
    },
    [updatePages, activePageId]
  )

  useEffect(() => {
    const loadSeller = async () => {
      try {
        const response = await authApi.getLoggedInSeller()
        setActiveShopId(response.seller.activeShopId ?? null)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load seller session")
      }
    }

    loadSeller()
  }, [])

  // ─── Undo / Redo ───
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    setPages(JSON.parse(historyRef.current[historyIndexRef.current]))
    setRenderKey((n) => n + 1)
    setSaveStatus("saving")
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 800)
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    setPages(JSON.parse(historyRef.current[historyIndexRef.current]))
    setRenderKey((n) => n + 1)
    setSaveStatus("saving")
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus("saved"), 800)
  }, [])

  // ─── Page management ───
  const handleSelectPage = useCallback((pageId: string) => {
    setActivePageId(pageId)
    setSelectedElementId(null)
    setSelectedSectionId(null)
    setEditingElementId(null)
    setHoveredElementId(null)
  }, [])

  const handleAddPage = useCallback(() => {
    const count = pages.length + 1
    const newPage = createDefaultPage(`Page ${count}`, `page-${count}`)
    updatePages((prev) => [...prev, newPage])
    setActivePageId(newPage.id)
    setSelectedElementId(null)
    setSelectedSectionId(null)
  }, [pages.length, updatePages])

  const handleDeletePage = useCallback(
    (pageId: string) => {
      const page = pages.find((p) => p.id === pageId)
      if (page?.isHome || pages.length <= 1) return
      updatePages((prev) => prev.filter((p) => p.id !== pageId))
      if (activePageId === pageId) {
        const remaining = pages.filter((p) => p.id !== pageId)
        setActivePageId(remaining[0]?.id || "")
      }
    },
    [pages, activePageId, updatePages]
  )

  const handleRenamePage = useCallback(
    (pageId: string, name: string) => {
      updatePages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? { ...p, name, slug: p.isHome ? "" : name.toLowerCase().replace(/\s+/g, "-") }
            : p
        )
      )
    },
    [updatePages]
  )

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedElementId &&
        !editingElementId
      ) {
        e.preventDefault()
        updateSections((prev) =>
          prev.map((s) => ({
            ...s,
            elements: s.elements
              .filter((el) => el.id !== selectedElementId)
              .map((el) => {
                if (el.type === "columns" && el.columnElements) {
                  return {
                    ...el,
                    columnElements: el.columnElements.map((col) =>
                      col.filter((c) => c.id !== selectedElementId)
                    ),
                  }
                }
                return el
              }),
          }))
        )
        setSelectedElementId(null)
      }
      if (e.key === "d" && (e.ctrlKey || e.metaKey) && selectedElementId) {
        e.preventDefault()
        updateSections((prev) =>
          prev.map((s) => {
            const idx = s.elements.findIndex((el) => el.id === selectedElementId)
            if (idx !== -1) {
              const clone = JSON.parse(JSON.stringify(s.elements[idx])) as BuilderElement
              clone.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
              const els = [...s.elements]
              els.splice(idx + 1, 0, clone)
              return { ...s, elements: els }
            }
            return {
              ...s,
              elements: s.elements.map((el) => {
                if (el.type === "columns" && el.columnElements) {
                  return {
                    ...el,
                    columnElements: el.columnElements.map((col) => {
                      const cidx = col.findIndex((c) => c.id === selectedElementId)
                      if (cidx === -1) return col
                      const clone = JSON.parse(JSON.stringify(col[cidx])) as BuilderElement
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
      }
      if (e.key === "Escape") {
        setSelectedElementId(null)
        setEditingElementId(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo, selectedElementId, editingElementId, updateSections])

  // ─── Properties panel update handler ───
  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<BuilderElement>) => {
      updateSections((prev) =>
        prev.map((s) => ({
          ...s,
          elements: s.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                ...updates,
                styles: updates.styles ? { ...el.styles, ...updates.styles } : el.styles,
              }
            }
            if (el.type === "columns" && el.columnElements) {
              return {
                ...el,
                ...(updates.columnCount !== undefined && el.id === id
                  ? { columnCount: updates.columnCount }
                  : {}),
                columnElements: el.columnElements.map((col) =>
                  col.map((child) => {
                    if (child.id === id) {
                      return {
                        ...child,
                        ...updates,
                        styles: updates.styles
                          ? { ...child.styles, ...updates.styles }
                          : child.styles,
                      }
                    }
                    return child
                  })
                ),
              }
            }
            return el
          }),
        }))
      )
    },
    [updateSections]
  )

  const handleDeleteElement = useCallback(
    (id: string) => {
      updateSections((prev) =>
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
    [updateSections, selectedElementId]
  )

  const handleDuplicateElement = useCallback(
    (id: string) => {
      updateSections((prev) =>
        prev.map((s) => {
          const idx = s.elements.findIndex((el) => el.id === id)
          if (idx !== -1) {
            const clone = JSON.parse(JSON.stringify(s.elements[idx])) as BuilderElement
            clone.id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
            const els = [...s.elements]
            els.splice(idx + 1, 0, clone)
            return { ...s, elements: els }
          }
          return {
            ...s,
            elements: s.elements.map((el) => {
              if (el.type === "columns" && el.columnElements) {
                return {
                  ...el,
                  columnElements: el.columnElements.map((col) => {
                    const cidx = col.findIndex((c) => c.id === id)
                    if (cidx === -1) return col
                    const clone = JSON.parse(JSON.stringify(col[cidx])) as BuilderElement
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
    [updateSections]
  )

  // ─── Derived: selected element ───
  const selectedElement = selectedElementId
    ? findElementById(sections, selectedElementId)
    : null

  // ─── Export HTML ───
  const handleExport = useCallback(() => {
    let fullHtml = ""
    for (const page of pages) {
      const pageHtml = page.sections
        .map((section) =>
          section.elements
            .map((el) => {
              if (el.type === "columns" && el.columnElements) {
                const cols = el.columnElements
                  .map(
                    (col) =>
                      `<div style="flex:1">${col.map((c) => `<div>${c.content}</div>`).join("")}</div>`
                  )
                  .join("")
                return `<div style="display:flex;gap:16px">${cols}</div>`
              }
              return `<div>${el.content}</div>`
            })
            .join("\n")
        )
        .join("\n\n")
      fullHtml += `\n<!-- Page: ${page.name} (/${page.slug}) -->\n<section>${pageHtml}</section>\n`
    }
    const blob = new Blob(
      [`<!DOCTYPE html><html><head><title>${activePage?.name || "Website"}</title></head><body>${fullHtml}</body></html>`],
      { type: "text/html" }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "website.html"
    a.click()
    URL.revokeObjectURL(url)
  }, [pages, activePage])

  const getWebsitePayload = useCallback(() => {
    const starter = createStarterWebsitePayload()

    return {
      name: website?.name || starter.name,
      slug: website?.slug || starter.slug,
      description: website?.description || starter.description,
      templateKey: website?.templateKey || starter.templateKey,
      theme: website?.theme || starter.theme,
      settings: website?.settings || starter.settings,
      seo: website?.seo || starter.seo,
      previewImage: website?.previewImage || "/placeholder.svg",
      pages,
      status: website?.isPublished ? "published" : "draft",
      isPublished: Boolean(website?.isPublished),
    }
  }, [pages, website])

  const handleSaveWebsite = useCallback(async () => {
    try {
      setError(null)
      setSaveStatus("saving")
      const payload = getWebsitePayload()
      const response =
        params.id === "new" && !website
          ? await websiteApi.create(payload, activeShopId ?? undefined)
          : await websiteApi.update(params.id, payload)
      setWebsite(response.website)
      if (params.id === "new") {
        window.history.replaceState({}, "", `/dashboard/builder/${response.website.id}`)
      }
      setSaveStatus("saved")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save website")
    }
  }, [activeShopId, getWebsitePayload, params.id, website])

  const handlePublishWebsite = useCallback(async () => {
    try {
      setError(null)
      setIsPublishing(true)
      const payload = getWebsitePayload()
      const currentWebsite =
        params.id === "new" && !website
          ? (await websiteApi.create(payload, activeShopId ?? undefined)).website
          : (await websiteApi.update(params.id, payload)).website
      const response = await websiteApi.publish(currentWebsite.id, {})
      setWebsite(response.website)
      setSaveStatus("saved")
      if (params.id === "new") {
        window.history.replaceState({}, "", `/dashboard/builder/${response.website.id}`)
      }
    } catch (publishError) {
      setError(
        publishError instanceof Error ? publishError.message : "Failed to publish website"
      )
    } finally {
      setIsPublishing(false)
    }
  }, [activeShopId, getWebsitePayload, params.id, website])

  const handleAddDomain = useCallback(async () => {
    if (!website?.id || !domainName.trim()) return

    try {
      setError(null)
      setIsDomainPending(true)
      const response = await websiteApi.addDomain(website.id, { domain: domainName })
      setWebsite((current) =>
        current
          ? { ...current, domains: [...current.domains, response.domain] }
          : current
      )
      setDomainName("")
    } catch (domainError) {
      setError(domainError instanceof Error ? domainError.message : "Failed to add domain")
    } finally {
      setIsDomainPending(false)
    }
  }, [domainName, website])

  const handleConnectDomain = useCallback(
    async (domainId: string) => {
      if (!website?.id) return

      try {
        const response = await websiteApi.connectDomain(website.id, domainId, {
          isPrimary: true,
        })
        setWebsite((current) =>
          current
            ? {
              ...current,
              domains: current.domains.map((domain) =>
                domain.id === domainId
                  ? response.domain
                  : { ...domain, isPrimary: false }
              ),
            }
            : current
        )
      } catch (connectError) {
        setError(
          connectError instanceof Error ? connectError.message : "Failed to connect domain"
        )
      }
    },
    [website]
  )

  const handleDeleteDomain = useCallback(
    async (domainId: string) => {
      if (!website?.id) return

      try {
        await websiteApi.deleteDomain(website.id, domainId)
        setWebsite((current) =>
          current
            ? {
              ...current,
              domains: current.domains.filter((domain) => domain.id !== domainId),
            }
            : current
        )
      } catch (deleteError) {
        setError(
          deleteError instanceof Error ? deleteError.message : "Failed to delete domain"
        )
      }
    },
    [website]
  )

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading builder...</div>
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* ─── Header / Toolbar ─── */}
        <header className="h-12 border-b bg-background flex items-center justify-between px-4 shrink-0">
          {/* Left: Brand + Active page indicator */}
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold tracking-tight">
              {website?.name || "Untitled Website"}
            </h1>
            <div className="h-4 w-px bg-border" />

            {/* Active page indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              <span className="font-medium text-foreground">{activePage?.name}</span>
              <span className="text-muted-foreground">/{activePage?.slug}</span>
            </div>

            <div className="h-4 w-px bg-border" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Undo (Ctrl+Z)
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted disabled:opacity-30 transition-colors"
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Redo (Ctrl+Shift+Z)
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Center: Device toggles */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {[
              { id: "desktop", icon: Monitor, label: "Desktop" },
              { id: "tablet", icon: Tablet, label: "Tablet" },
              { id: "mobile", icon: Smartphone, label: "Mobile" },
            ].map(({ id, icon: Icon, label }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveDevice(id)}
                    className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${activeDevice === id
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {saveStatus !== "idle" && (
              <div className="flex items-center gap-1.5 text-xs">
                {saveStatus === "saving" ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-muted-foreground">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Saved</span>
                  </>
                )}
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showPreview ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Toggle preview mode
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={handleExport}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Download as HTML
              </TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleSaveWebsite}
            >
              Save
            </Button>

            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handlePublishWebsite}
              disabled={isPublishing}
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </header>

        {error && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="border-b bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[280px] items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Input
                value={domainName}
                onChange={(event) => setDomainName(event.target.value)}
                placeholder="Add custom domain"
              />
              <Button
                size="sm"
                onClick={handleAddDomain}
                disabled={!website?.id || isDomainPending}
              >
                {isDomainPending ? "Adding..." : "Add"}
              </Button>
            </div>

            {(website?.domains || []).map((domain: WebsiteDomainRecord) => (
              <div
                key={domain.id}
                className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs"
              >
                <span>{domain.domain}</span>
                <span className="text-muted-foreground">{domain.status}</span>
                {domain.isPrimary ? (
                  <span className="text-emerald-600">Primary</span>
                ) : (
                  <button
                    className="text-blue-600"
                    onClick={() => handleConnectDomain(domain.id)}
                  >
                    Connect
                  </button>
                )}
                <button
                  className="text-red-600"
                  onClick={() => handleDeleteDomain(domain.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main body ─── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          {!showPreview && (
            <BuilderSidebar
              sections={sections}
              pages={pages}
              activePageId={activePageId}
              selectedElementId={selectedElementId}
              selectedSectionId={selectedSectionId}
              onSelectElement={(elementId, sectionId) => {
                setSelectedElementId(elementId)
                setSelectedSectionId(sectionId)
              }}
              onSelectSection={(sectionId) => {
                setSelectedSectionId(sectionId)
                setSelectedElementId(null)
              }}
              onSelectPage={handleSelectPage}
              onAddPage={handleAddPage}
              onDeletePage={handleDeletePage}
              onRenamePage={handleRenamePage}
            />
          )}

          {/* Canvas */}
          <BuilderCanvas
            sections={sections}
            setSections={(updater) => {
              if (typeof updater === "function") {
                updateSections(updater)
              } else {
                updateSections(() => updater)
              }
            }}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            selectedSectionId={selectedSectionId}
            setSelectedSectionId={setSelectedSectionId}
            hoveredElementId={hoveredElementId}
            setHoveredElementId={setHoveredElementId}
            editingElementId={editingElementId}
            setEditingElementId={setEditingElementId}
            activeDevice={activeDevice}
            showPreview={showPreview}
          />

          {/* Right properties panel */}
          {!showPreview && (
            <PropertiesPanel
              element={selectedElement}
              onUpdate={handleUpdateElement}
              onDelete={handleDeleteElement}
              onDuplicate={handleDuplicateElement}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
