'use client'

import { Conversation, User } from '@/types'
import { MessageSquare } from 'lucide-react'

interface ConversationListProps {
    conversations: Conversation[]
    current: Conversation | null
    onSelect: (conversation: Conversation) => void
    currentUser: User | null
}

const getInitials = (name = '') =>
    name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')

export function ConversationList({
    conversations,
    current,
    onSelect,
    currentUser,
}: ConversationListProps) {
    return (
        <aside className="w-80 border-r border-slate-800 bg-slate-950 text-slate-100">
            <div className="border-b border-slate-800 px-5 py-4">
                <h2 className="text-lg font-semibold">Messages</h2>
                <p className="mt-1 text-sm text-slate-400">{conversations.length} chats</p>
            </div>

            <div className="space-y-2 p-3">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelect(conv)}
                        className={`group flex w-full items-start gap-3 rounded-3xl border px-4 py-3 text-left transition ${current?.id === conv.id
                                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100 shadow-inner shadow-cyan-500/10'
                                : 'border-transparent bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900'
                            }`}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-700 text-sm font-semibold text-slate-100">
                            {getInitials(conv.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{conv.name}</p>
                            <p className="mt-1 truncate text-sm text-slate-400">
                                {conv.lastMessage?.content ?? conv.members?.filter((m) => m.id !== currentUser?.id).map((m) => m.name).join(', ') ?? 'No messages yet'}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    )
}
