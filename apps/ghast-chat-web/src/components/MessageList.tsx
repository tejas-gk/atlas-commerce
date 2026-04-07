'use client'

import { Message, User } from '@/types'
import { Check, CheckCircle2 } from 'lucide-react'

interface MessageListProps {
    messages: Message[]
    currentUser: User | null
}

const formatTime = (timestamp: string) =>
    new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(timestamp))

export function MessageList({ messages, currentUser }: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-900 p-4">
            <div className="space-y-4">
                {messages.map((message) => {
                    const isOwn = message.senderId === currentUser?.id
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-lg ${isOwn
                                    ? 'bg-cyan-500 text-slate-950'
                                    : 'bg-slate-800 text-slate-100'
                                }`}
                            >
                                {!isOwn && (
                                    <p className="text-xs uppercase tracking-wide text-slate-400">
                                        {message.sender?.name || 'Unknown'}
                                    </p>
                                )}
                                <p className="mt-1 break-words text-sm leading-6">{message.content}</p>
                                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                                    <span>{formatTime(message.createdAt)}</span>
                                    {isOwn && (
                                        <span className="inline-flex items-center gap-1 text-cyan-100">
                                            {message.status === 'read' ? (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            ) : (
                                                <Check className="h-3.5 w-3.5" />
                                            )}
                                            {message.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
