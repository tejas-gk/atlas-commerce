import type { BuilderElement, BuilderPage, BuilderSection, ElementType } from "@/lib/builder-types"
import { createDefaultPage, createNewElement } from "@/lib/builder-types"

export interface BuilderAgentOperation {
  type:
    | "add_page"
    | "rename_page"
    | "delete_page"
    | "add_section"
    | "rename_section"
    | "delete_section"
    | "add_element"
    | "update_element"
    | "delete_element"
  targetPage?: string
  targetSection?: string
  targetElementType?: ElementType
  matchText?: string
  newPageName?: string
  newSlug?: string
  newSectionName?: string
  elementType?: ElementType
  content?: string
  href?: string
  placement?: "prepend" | "append"
  styles?: Partial<BuilderElement["styles"]>
}

export interface BuilderAgentPlan {
  assistantMessage: string
  operations: BuilderAgentOperation[]
}

export interface BuilderAgentApplyResult {
  pages: BuilderPage[]
  activePageId: string
  selectedElementId: string | null
  changes: string[]
  warnings: string[]
}

function normalize(value?: string | null) {
  return (value || "").trim().toLowerCase()
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "new-page"
}

function clip(value?: string, max = 72) {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function findPage(pages: BuilderPage[], targetPage: string | undefined, activePageId: string) {
  if (targetPage) {
    const wanted = normalize(targetPage)
    const exact = pages.find(
      (page) => normalize(page.name) === wanted || normalize(page.slug) === wanted
    )
    if (exact) return exact

    const partial = pages.find(
      (page) =>
        normalize(page.name).includes(wanted) || normalize(page.slug).includes(wanted)
    )
    if (partial) return partial
  }

  return pages.find((page) => page.id === activePageId) || pages[0]
}

function findSection(page: BuilderPage, targetSection?: string) {
  if (!targetSection) return page.sections[0]

  const wanted = normalize(targetSection)
  const exact = page.sections.find((section) => normalize(section.name) === wanted)
  if (exact) return exact

  return page.sections.find((section) => normalize(section.name).includes(wanted))
}

function visitElements(
  sections: BuilderSection[],
  visitor: (
    element: BuilderElement,
    location:
      | { section: BuilderSection; index: number }
      | { section: BuilderSection; parent: BuilderElement; columnIndex: number; index: number }
  ) => boolean
) {
  for (const section of sections) {
    for (let index = 0; index < section.elements.length; index += 1) {
      const element = section.elements[index]
      if (visitor(element, { section, index })) return

      if (element.type === "columns" && element.columnElements) {
        for (let columnIndex = 0; columnIndex < element.columnElements.length; columnIndex += 1) {
          const column = element.columnElements[columnIndex]
          for (let childIndex = 0; childIndex < column.length; childIndex += 1) {
            const child = column[childIndex]
            if (
              visitor(child, {
                section,
                parent: element,
                columnIndex,
                index: childIndex,
              })
            ) {
              return
            }
          }
        }
      }
    }
  }
}

function matchElement(
  element: BuilderElement,
  targetElementType?: ElementType,
  matchText?: string
) {
  const typeMatches = !targetElementType || element.type === targetElementType
  const textMatches =
    !matchText || normalize(element.content).includes(normalize(matchText))

  return typeMatches && textMatches
}

function applyElementFields(element: BuilderElement, operation: BuilderAgentOperation) {
  if (typeof operation.content === "string") {
    element.content = operation.content
  }

  if (typeof operation.href === "string") {
    element.href = operation.href
  }

  if (operation.styles) {
    element.styles = {
      ...element.styles,
      ...operation.styles,
    }
  }
}

export function summarizeBuilderContext(
  pages: BuilderPage[],
  activePageId: string,
  selectedElementId: string | null
) {
  return {
    activePage:
      pages.find((page) => page.id === activePageId)?.name ||
      pages[0]?.name ||
      "Home",
    selectedElementId,
    pages: pages.map((page) => ({
      name: page.name,
      slug: page.slug || "/",
      isHome: Boolean(page.isHome),
      sections: page.sections.map((section) => ({
        name: section.name,
        elements: section.elements.map((element) => ({
          type: element.type,
          content: clip(element.content, 80),
          columns:
            element.type === "columns" && element.columnElements
              ? element.columnElements.map((column) =>
                  column.map((child) => ({
                    type: child.type,
                    content: clip(child.content, 48),
                  }))
                )
              : undefined,
        })),
      })),
    })),
  }
}

export function applyBuilderAgentPlan(
  pages: BuilderPage[],
  activePageId: string,
  plan: BuilderAgentPlan
): BuilderAgentApplyResult {
  const nextPages = JSON.parse(JSON.stringify(pages)) as BuilderPage[]
  const changes: string[] = []
  const warnings: string[] = []
  let nextActivePageId = activePageId
  let selectedElementId: string | null = null

  for (const operation of plan.operations) {
    switch (operation.type) {
      case "add_page": {
        const pageName = operation.newPageName?.trim() || "New Page"
        const slug = operation.newSlug?.trim() || createSlug(pageName)
        const newPage = createDefaultPage(pageName, slug)
        nextPages.push(newPage)
        nextActivePageId = newPage.id
        changes.push(`Added page "${pageName}"`)
        break
      }
      case "rename_page": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to rename.")
          break
        }

        if (operation.newPageName?.trim()) {
          page.name = operation.newPageName.trim()
        }
        if (typeof operation.newSlug === "string") {
          page.slug = createSlug(operation.newSlug)
        } else if (operation.newPageName?.trim() && !page.isHome) {
          page.slug = createSlug(operation.newPageName)
        }
        changes.push(`Updated page "${page.name}"`)
        break
      }
      case "delete_page": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to delete.")
          break
        }
        if (page.isHome || nextPages.length <= 1) {
          warnings.push(`Skipped deleting "${page.name}" because the home page must remain.`)
          break
        }

        const index = nextPages.findIndex((candidate) => candidate.id === page.id)
        nextPages.splice(index, 1)
        nextActivePageId = nextPages[Math.max(0, index - 1)]?.id || nextPages[0].id
        changes.push(`Deleted page "${page.name}"`)
        break
      }
      case "add_section": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to add a section to.")
          break
        }

        const sectionName = operation.newSectionName?.trim() || "New Section"
        const section: BuilderSection = {
          id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: sectionName,
          elements: [],
        }

        if (operation.placement === "prepend") {
          page.sections.unshift(section)
        } else {
          page.sections.push(section)
        }

        nextActivePageId = page.id
        changes.push(`Added section "${sectionName}" to "${page.name}"`)
        break
      }
      case "rename_section": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        const section = page ? findSection(page, operation.targetSection) : null
        if (!page || !section) {
          warnings.push("Could not find a section to rename.")
          break
        }

        section.name = operation.newSectionName?.trim() || section.name
        nextActivePageId = page.id
        changes.push(`Renamed section to "${section.name}"`)
        break
      }
      case "delete_section": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        const section = page ? findSection(page, operation.targetSection) : null
        if (!page || !section) {
          warnings.push("Could not find a section to delete.")
          break
        }

        page.sections = page.sections.filter((candidate) => candidate.id !== section.id)
        nextActivePageId = page.id
        changes.push(`Deleted section "${section.name}" from "${page.name}"`)
        break
      }
      case "add_element": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to add an element to.")
          break
        }

        let section = findSection(page, operation.targetSection)
        if (!section) {
          section = {
            id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: operation.targetSection?.trim() || "New Section",
            elements: [],
          }
          page.sections.push(section)
        }

        const elementType = operation.elementType || "paragraph"
        const element = createNewElement(elementType)
        applyElementFields(element, operation)

        if (operation.placement === "prepend") {
          section.elements.unshift(element)
        } else {
          section.elements.push(element)
        }

        selectedElementId = element.id
        nextActivePageId = page.id
        changes.push(`Added ${element.type} to "${section.name}"`)
        break
      }
      case "update_element": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to update an element on.")
          break
        }

        let updated = false
        visitElements(
          operation.targetSection ? [findSection(page, operation.targetSection)].filter(Boolean) as BuilderSection[] : page.sections,
          (element) => {
            if (!matchElement(element, operation.targetElementType, operation.matchText)) {
              return false
            }

            applyElementFields(element, operation)
            selectedElementId = element.id
            nextActivePageId = page.id
            changes.push(`Updated ${element.type} on "${page.name}"`)
            updated = true
            return true
          }
        )

        if (!updated) {
          warnings.push("Could not find an element to update.")
        }
        break
      }
      case "delete_element": {
        const page = findPage(nextPages, operation.targetPage, nextActivePageId)
        if (!page) {
          warnings.push("Could not find a page to delete an element from.")
          break
        }

        let removed = false
        visitElements(
          operation.targetSection ? [findSection(page, operation.targetSection)].filter(Boolean) as BuilderSection[] : page.sections,
          (element, location) => {
            if (!matchElement(element, operation.targetElementType, operation.matchText)) {
              return false
            }

            if ("parent" in location) {
              location.parent.columnElements?.[location.columnIndex].splice(location.index, 1)
            } else {
              location.section.elements.splice(location.index, 1)
            }

            changes.push(`Deleted ${element.type} from "${page.name}"`)
            removed = true
            return true
          }
        )

        if (!removed) {
          warnings.push("Could not find an element to delete.")
        }
        break
      }
      default:
        warnings.push("Skipped an unsupported agent operation.")
    }
  }

  return {
    pages: nextPages,
    activePageId: nextActivePageId,
    selectedElementId,
    changes,
    warnings,
  }
}
