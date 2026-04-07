import { create } from 'zustand'
import { ChatState, Conversation, Message, User } from '@/types'

export const useChatStore = create<ChatState>((set) => ({
    user: null,
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    error: null,

    setUser: (user) => set({ user }),
    setConversations: (conversations) => set({ conversations }),
    setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({
        messages: state.messages.some((existing) => existing.id === message.id)
            ? state.messages
            : [...state.messages, message],
    })),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
}))
