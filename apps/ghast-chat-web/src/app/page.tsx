'use client'

import { ConversationList } from '@/components/ConversationList'
import { CreateConversationModal } from '@/components/CreateConversationModal'
import { MessageInput } from '@/components/MessageInput'
import { MessageList } from '@/components/MessageList'
import { chatApi } from '@/lib/api'
import { useChatStore } from '@/lib/store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { LogOut, Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Conversation, User, WebSocketMessage } from '@/types'

const createDemoUser = (id: string): User => ({
    id,
    email: `${id}@example.com`,
    name: 'You',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

export default function ChatPage() {
    const user = useChatStore((state) => state.user)
    const conversations = useChatStore((state) => state.conversations)
    const currentConversation = useChatStore((state) => state.currentConversation)
    const messages = useChatStore((state) => state.messages)
    const isLoading = useChatStore((state) => state.isLoading)
    const error = useChatStore((state) => state.error)
    const setUser = useChatStore((state) => state.setUser)
    const setConversations = useChatStore((state) => state.setConversations)
    const setCurrentConversation = useChatStore((state) => state.setCurrentConversation)
    const setMessages = useChatStore((state) => state.setMessages)
    const addMessage = useChatStore((state) => state.addMessage)
    const setLoading = useChatStore((state) => state.setLoading)
    const setError = useChatStore((state) => state.setError)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [typingUsers, setTypingUsers] = useState<string[]>([])
    const [sending, setSending] = useState(false)
    const [localTyping, setLocalTyping] = useState(false)
    const typingTimeout = useRef<number | undefined>()

    const { isConnected, message: wsMessage, sendMessage: wsSend } = useWebSocket(
        user?.id || '',
        currentConversation?.id || ''
    )

    const availableUsers = useMemo(() => {
        const map = new Map<string, User>()
        conversations.flatMap((conversation) => conversation.members || []).forEach((member) => {
            if (member?.id) map.set(member.id, member)
        })
        if (user) {
            map.set(user.id, user)
        }
        return Array.from(map.values()).filter((member) => member.id !== user?.id)
    }, [conversations, user])

    useEffect(() => {
        const uid = sessionStorage.getItem('userId')
        if (!uid) {
            const demoId = 'user-' + Math.random().toString(36).slice(2, 11)
            const demoUser = createDemoUser(demoId)
            sessionStorage.setItem('userId', demoId)
            setUser(demoUser)
        } else {
            setUser(createDemoUser(uid))
        }
    }, [setUser])

    useEffect(() => {
        if (!user) return

        const loadConversations = async () => {
            try {
                setLoading(true)
                const data = await chatApi.getConversations(user.id)
                const conversationsData = data.conversations || []
                setConversations(conversationsData)
                if (!currentConversation && conversationsData.length > 0) {
                    setCurrentConversation(conversationsData[0])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load conversations')
            } finally {
                setLoading(false)
            }
        }

        loadConversations()
    }, [user, currentConversation, setConversations, setCurrentConversation, setError, setLoading])

    useEffect(() => {
        if (!user || !currentConversation) return

        const loadMessages = async () => {
            try {
                setLoading(true)
                const data = await chatApi.getMessages(user.id, currentConversation.id)
                setMessages(data.messages || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load messages')
            } finally {
                setLoading(false)
            }
        }

        loadMessages()
    }, [user, currentConversation, setMessages, setError, setLoading])

    useEffect(() => {
        if (!wsMessage) return

        if (wsMessage.type === 'message' && wsMessage.action === 'new') {
            addMessage(wsMessage.data as any)
        }

        if (wsMessage.type === 'typing') {
            const userName = String(wsMessage.data?.userName || 'Someone')
            if (userName === user?.name) return

            setTypingUsers((prev) => {
                if (wsMessage.action === 'start') {
                    return prev.includes(userName) ? prev : [...prev, userName]
                }
                return prev.filter((name) => name !== userName)
            })
        }
    }, [wsMessage, addMessage, user?.name])

    useEffect(() => {
        return () => {
            if (typingTimeout.current) {
                window.clearTimeout(typingTimeout.current)
            }
        }
    }, [])

    const handleSelectConversation = (conversation: Conversation) => {
        setMessages([])
        setCurrentConversation(conversation)
    }

    const handleSendMessage = async (content: string) => {
        if (!user || !currentConversation) return

        const payload = {
            conversationId: currentConversation.id,
            content,
            type: 'text',
        }

        try {
            setSending(true)
            const response = await chatApi.sendMessage(user.id, payload)
            if (response?.message) {
                addMessage(response.message)
            }
            wsSend({
                type: 'message',
                action: 'new',
                data: {
                    ...payload,
                    senderId: user.id,
                    sender: user,
                    createdAt: new Date().toISOString(),
                },
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message')
        } finally {
            setSending(false)
        }
    }

    const handleTyping = (typing: boolean, value: string) => {
        if (!user || !currentConversation) return

        setLocalTyping(typing)
        if (typingTimeout.current) {
            window.clearTimeout(typingTimeout.current)
        }

        if (typing) {
            wsSend({
                type: 'typing',
                action: 'start',
                data: {
                    conversationId: currentConversation.id,
                    userId: user.id,
                    userName: user.name,
                    message: value,
                },
            })
            typingTimeout.current = window.setTimeout(() => {
                setLocalTyping(false)
                wsSend({
                    type: 'typing',
                    action: 'stop',
                    data: {
                        conversationId: currentConversation.id,
                        userId: user.id,
                        userName: user.name,
                    },
                })
            }, 1000)
            return
        }

        wsSend({
            type: 'typing',
            action: 'stop',
            data: {
                conversationId: currentConversation.id,
                userId: user.id,
                userName: user.name,
            },
        })
    }

    const handleCreateConversation = async (conversationData: {
        name: string
        isGroup: boolean
        members: User[]
    }) => {
        if (!user) return

        try {
            setLoading(true)
            const response = await chatApi.createConversation(user.id, {
                ...conversationData,
                members: [user, ...conversationData.members],
            })
            if (response?.conversation) {
                const nextList = [response.conversation, ...conversations]
                setConversations(nextList)
                setCurrentConversation(response.conversation)
                setIsModalOpen(false)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create conversation')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('userId')
        setUser(null)
        setTypingUsers([])
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-10 text-slate-100">
                <div className="max-w-xl rounded-3xl border border-slate-700 bg-slate-950/90 p-10 shadow-2xl shadow-slate-950/40">
                    <h1 className="mb-4 text-4xl font-bold">Ghast Chat</h1>
                    <p className="mb-6 text-slate-400">Preparing your secure messaging session.</p>
                    <div className="h-3 rounded-full bg-slate-800">
                        <div className="h-3 w-1/3 animate-pulse rounded-full bg-cyan-500"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
            <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 shadow-lg shadow-slate-950/20">
                <div>
                    <h1 className="text-2xl font-semibold">Ghast Chat</h1>
                    <p className="text-sm text-slate-400">Real-time team messaging with WebSocket sync</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${isConnected ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                        <Plus className="h-4 w-4" /> New chat
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <ConversationList
                    conversations={conversations}
                    current={currentConversation}
                    onSelect={handleSelectConversation}
                    currentUser={user}
                />

                <main className="flex flex-1 flex-col bg-slate-950">
                    {currentConversation ? (
                        <div className="flex h-full flex-col">
                            <div className="border-b border-slate-800 bg-slate-900 px-6 py-4">
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-semibold">{currentConversation.name}</h2>
                                        <p className="text-sm text-slate-400">
                                            {currentConversation.members?.length
                                                ? `${currentConversation.members.length} participant${currentConversation.members.length > 1 ? 's' : ''}`
                                                : 'Private conversation'}
                                        </p>
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        {typingUsers.length > 0
                                            ? `${typingUsers.join(', ')} typing…`
                                            : localTyping
                                                ? 'You are typing…'
                                                : 'Messages are synced live.'}
                                    </div>
                                </div>
                            </div>

                            <MessageList messages={messages} currentUser={user} />
                            <MessageInput onSend={handleSendMessage} onTyping={handleTyping} isLoading={sending} />
                        </div>
                    ) : (
                        <div className="flex flex-1 items-center justify-center px-6">
                            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/90 px-10 py-12 text-center">
                                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-400">Select a conversation</p>
                                <h2 className="text-3xl font-semibold">Start chatting instantly</h2>
                                <p className="mt-3 max-w-xl text-slate-400">
                                    Pick a conversation from the left panel or create a new chat to begin sending messages.
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <CreateConversationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateConversation}
                availableUsers={availableUsers}
                currentUser={user}
            />

            {error && (
                <div className="fixed bottom-6 right-6 max-w-sm rounded-3xl bg-red-600 px-5 py-4 text-sm text-white shadow-2xl shadow-red-900/30">
                    {error}
                </div>
            )}
        </div>
    )
}
