'use client'

import { Send, Smile } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MessageInputProps {
    onSend: (message: string) => void
    onTyping?: (isTyping: boolean, value: string) => void
    isLoading?: boolean
}

const EMOJIS = ['😀', '😂', '🥳', '❤️', '👍', '🔥', '😎', '✅', '🤖']

export function MessageInput({ onSend, onTyping, isLoading }: MessageInputProps) {
    const [input, setInput] = useState('')
    const [showEmoji, setShowEmoji] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        const typing = input.trim().length > 0
        setIsTyping(typing)
        onTyping?.(typing, input)
    }, [input, onTyping])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = input.trim()
        if (!trimmed || isLoading) return
        onSend(trimmed)
        setInput('')
        setShowEmoji(false)
    }

    const handleEmojiClick = (emoji: string) => {
        setInput((prev) => `${prev}${emoji}`)
        setShowEmoji(false)
    }

    return (
        <div className="border-t border-slate-700 bg-slate-950/95 px-4 py-3">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setShowEmoji((prev) => !prev)}
                    className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-200 transition hover:bg-slate-800"
                    aria-label="Toggle emoji picker"
                >
                    <Smile className="h-5 w-5" />
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Send className="h-5 w-5" />
                </button>
            </form>

            {showEmoji && (
                <div className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-slate-900 p-3 shadow-lg shadow-slate-950/30">
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-lg transition hover:bg-slate-800"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {isTyping && (
                <p className="mt-2 text-xs text-slate-400">Typing…</p>
            )}
        </div>
    )
}
