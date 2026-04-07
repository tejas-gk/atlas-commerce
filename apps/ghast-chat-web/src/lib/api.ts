const API_BASE = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:8090'

export const chatApi = {
    // Conversations
    getConversations: async (userId: string) => {
        const res = await fetch(`${API_BASE}/api/v1/conversations`, {
            headers: { 'X-User-ID': userId },
            credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch conversations')
        return res.json()
    },

    createConversation: async (userId: string, data: any) => {
        const res = await fetch(`${API_BASE}/api/v1/conversations/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to create conversation')
        return res.json()
    },

    // Messages
    getMessages: async (userId: string, conversationId: string) => {
        const res = await fetch(
            `${API_BASE}/api/v1/messages?conversation_id=${conversationId}`,
            {
                headers: { 'X-User-ID': userId },
                credentials: 'include',
            }
        )
        if (!res.ok) throw new Error('Failed to fetch messages')
        return res.json()
    },

    sendMessage: async (userId: string, data: any) => {
        const res = await fetch(`${API_BASE}/api/v1/messages/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': userId,
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to send message')
        return res.json()
    },

    // WebSocket
    connectWebSocket: (userId: string, conversationId: string) => {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const wsUrl = `${protocol}://${API_BASE.replace(/^https?:\/\//, '')}/ws`
        return new WebSocket(
            `${wsUrl}?user_id=${userId}&conversation_id=${conversationId}`
        )
    },
}
