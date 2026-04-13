import { NextResponse } from "next/server"
import type { BuilderPage } from "@/lib/builder-types"
import { summarizeBuilderContext, type BuilderAgentPlan } from "@/lib/builder-agent"

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"
const DEFAULT_MODEL = process.env.OPENAI_BUILDER_MODEL || "gpt-4o-mini"

const AGENT_PLAN_SCHEMA = {
  name: "builder_agent_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      assistantMessage: {
        type: "string",
      },
      operations: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              enum: [
                "add_page",
                "rename_page",
                "delete_page",
                "add_section",
                "rename_section",
                "delete_section",
                "add_element",
                "update_element",
                "delete_element",
              ],
            },
            targetPage: { type: "string" },
            targetSection: { type: "string" },
            targetElementType: {
              type: "string",
              enum: [
                "heading",
                "paragraph",
                "image",
                "button",
                "search-bar",
                "hero-slider",
                "oauth-login",
                "navigation",
                "list",
                "custom-code",
                "divider",
                "spacer",
                "video",
                "columns",
                "quote",
                "icon",
                "social-links",
                "form-input",
                "form-textarea",
                "form",
                "table",
                "progress",
                "badge-element",
                "accordion",
                "embed",
                "map",
                "countdown",
                "gallery",
                "product-card",
                "product-grid",
                "recommended-products",
                "product-filters",
                "shopping-cart",
                "card-element",
                "tabs-element",
                "avatar-element",
                "alert-element",
                "dialog-element",
                "popover-element",
                "collapsible-element",
                "hover-card-element",
                "skeleton-element",
                "select-element",
                "checkbox-element",
                "switch-element",
                "slider-element",
                "carousel-element",
                "command-element",
                "radio-group-element",
                "breadcrumb-element",
                "pagination-element",
                "callout",
                "ribbon",
              ],
            },
            matchText: { type: "string" },
            newPageName: { type: "string" },
            newSlug: { type: "string" },
            newSectionName: { type: "string" },
            elementType: {
              type: "string",
              enum: [
                "heading",
                "paragraph",
                "image",
                "button",
                "search-bar",
                "hero-slider",
                "oauth-login",
                "navigation",
                "list",
                "custom-code",
                "divider",
                "spacer",
                "video",
                "columns",
                "quote",
                "icon",
                "social-links",
                "form-input",
                "form-textarea",
                "form",
                "table",
                "progress",
                "badge-element",
                "accordion",
                "embed",
                "map",
                "countdown",
                "gallery",
                "product-card",
                "product-grid",
                "recommended-products",
                "product-filters",
                "shopping-cart",
                "card-element",
                "tabs-element",
                "avatar-element",
                "alert-element",
                "dialog-element",
                "popover-element",
                "collapsible-element",
                "hover-card-element",
                "skeleton-element",
                "select-element",
                "checkbox-element",
                "switch-element",
                "slider-element",
                "carousel-element",
                "command-element",
                "radio-group-element",
                "breadcrumb-element",
                "pagination-element",
                "callout",
                "ribbon",
              ],
            },
            content: { type: "string" },
            href: { type: "string" },
            placement: {
              type: "string",
              enum: ["prepend", "append"],
            },
            styles: {
              type: "object",
              additionalProperties: false,
              properties: {
                width: { type: "string" },
                height: { type: "string" },
                alignment: {
                  type: "string",
                  enum: ["left", "center", "right"],
                },
                color: { type: "string" },
                backgroundColor: { type: "string" },
                fontSize: { type: "string" },
                fontWeight: { type: "string" },
                fontStyle: { type: "string" },
                textDecoration: { type: "string" },
                borderRadius: { type: "string" },
                border: { type: "string" },
                opacity: { type: "string" },
                boxShadow: { type: "string" },
                letterSpacing: { type: "string" },
                lineHeight: { type: "string" },
                backgroundImage: { type: "string" },
                price: { type: "string" },
              },
              required: [],
            },
          },
          required: ["type"],
        },
      },
    },
    required: ["assistantMessage", "operations"],
  },
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Add it to the website-builder environment first." },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as {
      prompt?: string
      pages?: BuilderPage[]
      activePageId?: string
      selectedElementId?: string | null
    }

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 })
    }

    const pages = Array.isArray(body.pages) ? body.pages : []
    if (!pages.length) {
      return NextResponse.json({ error: "Builder context is required." }, { status: 400 })
    }

    const builderContext = summarizeBuilderContext(
      pages,
      body.activePageId || pages[0]?.id || "",
      body.selectedElementId || null
    )

    const openAIResponse = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are an expert website-builder agent. Return JSON only. Create the smallest set of operations needed to fulfill the user's request. Use existing page names and section names when possible. Prefer editing current content over deleting large areas. If the user is vague, make tasteful ecommerce-friendly choices. Do not invent unsupported operations.",
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction: body.prompt.trim(),
              availableOperationTypes: [
                "add_page",
                "rename_page",
                "delete_page",
                "add_section",
                "rename_section",
                "delete_section",
                "add_element",
                "update_element",
                "delete_element",
              ],
              builderContext,
            }),
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: AGENT_PLAN_SCHEMA,
        },
      }),
    })

    if (!openAIResponse.ok) {
      const errorPayload = await openAIResponse.json().catch(() => null)
      return NextResponse.json(
        {
          error:
            errorPayload?.error?.message ||
            "OpenAI request failed while generating the builder plan.",
        },
        { status: 500 }
      )
    }

    const payload = await openAIResponse.json()
    const content = payload?.choices?.[0]?.message?.content

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "OpenAI returned an unexpected response format." },
        { status: 500 }
      )
    }

    const plan = JSON.parse(content) as BuilderAgentPlan
    return NextResponse.json({ plan })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while generating builder changes.",
      },
      { status: 500 }
    )
  }
}
