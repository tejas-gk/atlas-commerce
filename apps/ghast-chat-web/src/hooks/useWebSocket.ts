import { useEffect, useRef, useState } from 'react'
import { WebSocketMessage } from '@/types'

export const useWebSocket = (userId: string, conversationId: string) => {
    const wsRef = useRef<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [message, setMessage] = useState<WebSocketMessage | null>(null)

    useEffect(() => {
        if (!userId || !conversationId) return

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
        const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'localhost:8090'
        const wsUrl = `${protocol}://${chatApiUrl}/ws?user_id=${userId}&conversation_id=${conversationId}`

        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
            setIsConnected(true)
            console.log('WebSocket connected')
        }

        wsRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                setMessage(data)
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err)
            }
        }

        wsRef.current.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        wsRef.current.onclose = () => {
            setIsConnected(false)
            console.log('WebSocket disconnected')
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [userId, conversationId])

    const sendMessage = (data: any) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send(JSON.stringify(data))
        }
    }

    return { isConnected, message, sendMessage }
}
