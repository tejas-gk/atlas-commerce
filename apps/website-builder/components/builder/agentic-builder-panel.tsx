"use client"

import { useState } from "react"
import type { BuilderPage } from "@/lib/builder-types"
import {
  applyBuilderAgentPlan,
  type BuilderAgentPlan,
} from "@/lib/builder-agent"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Send, Bot, User, Wand2 } from "lucide-react"

interface BuilderChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  changes?: string[]
  warnings?: string[]
}

const SUGGESTIONS = [
  "Build a bold home page for a premium sneaker brand with hero, featured products, and testimonials.",
  "Add an About page and a Contact page, then create a cleaner navigation.",
  "Turn this into a modern electronics store with product filters and a featured collections section.",
]

export function AgenticBuilderPanel({
  pages,
  activePageId,
  selectedElementId,
  onApplyResult,
}: {
  pages: BuilderPage[]
  activePageId: string
  selectedElementId: string | null
  onApplyResult: (result: ReturnType<typeof applyBuilderAgentPlan>) => void
}) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<BuilderChatMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      content:
        "Describe the site you want and I'll update the builder for you. I can add pages, create sections, drop in elements, and rewrite existing content.",
    },
  ])

  async function submit(nextPrompt?: string) {
    const finalPrompt = (nextPrompt ?? prompt).trim()
    if (!finalPrompt || isLoading) return

    setError(null)
    setIsLoading(true)
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: finalPrompt,
      },
    ])
    setPrompt("")

    try {
      const response = await fetch("/api/ai/builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          pages,
          activePageId,
          selectedElementId,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to generate builder updates.")
      }

      const plan = payload.plan as BuilderAgentPlan
      const result = applyBuilderAgentPlan(pages, activePageId, plan)
      onApplyResult(result)

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: plan.assistantMessage,
          changes: result.changes,
          warnings: result.warnings,
        },
      ])
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while talking to the builder agent."
      setError(message)
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content: `I couldn't apply that request yet. ${message}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold">AI Builder</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Natural-language editing for your current website draft.
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Agentic
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-blue-50/70 p-3 text-xs leading-relaxed text-blue-800">
            Tell me layout, sections, style direction, and store intent. I'll turn that into pages and builder blocks.
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => submit(suggestion)}
                disabled={isLoading}
                className="rounded-full border bg-background px-3 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:border-blue-300 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-1">
                  <Wand2 className="h-3 w-3" />
                  {suggestion}
                </span>
              </button>
            ))}
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border p-3 ${
                message.role === "assistant" ? "bg-background" : "bg-slate-50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                {message.role === "assistant" ? (
                  <>
                    <Bot className="h-3.5 w-3.5 text-blue-600" />
                    Builder Agent
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5 text-slate-600" />
                    You
                  </>
                )}
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.content}
              </p>

              {message.changes && message.changes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.changes.map((change) => (
                    <Badge key={change} variant="secondary" className="text-[10px]">
                      {change}
                    </Badge>
                  ))}
                </div>
              )}

              {message.warnings && message.warnings.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
                  {message.warnings.join(" ")}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Example: Create a luxe fashion homepage with a hero banner, featured products, and a contact section."
            className="min-h-[110px] resize-none text-sm"
          />
          <Button
            type="button"
            onClick={() => submit()}
            disabled={isLoading || !prompt.trim()}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Building..." : "Build with AI"}
          </Button>
        </div>
      </div>
    </div>
  )
}
