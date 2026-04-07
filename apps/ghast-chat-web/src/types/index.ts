// Type definitions for chat application

export interface User {
    id: string
    email: string
    name: string
    createdAt: string
    updatedAt: string
}

export interface Message {
    id: string
    conversationId: string
    senderId: string
    content: string
    type: 'text' | 'image' | 'file'
    status: 'sent' | 'delivered' | 'read'
    createdAt: string
    updatedAt: string
    sender?: User
}

export interface Conversation {
    id: string
    name: string
    description?: string
    isGroup: boolean
    creatorId: string
    createdAt: string
    updatedAt: string
    members?: User[]
    lastMessage?: Message
}

export interface WebSocketMessage {
    type: string
    action: string
    data: Record<string, any>
    timestamp: string
}

export interface ChatState {
    user: User | null
    conversations: Conversation[]
    currentConversation: Conversation | null
    messages: Message[]
    isLoading: boolean
    error: string | null
    setUser: (user: User | null) => void
    setConversations: (conversations: Conversation[]) => void
    setCurrentConversation: (conversation: Conversation | null) => void
    setMessages: (messages: Message[]) => void
    addMessage: (message: Message) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
}
