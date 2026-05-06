import type { Metadata } from 'next'

import "@workspace/ui/globals.css"

export const metadata: Metadata = {
    title: 'Ghast Chat',
    description: 'A WhatsApp-style real-time chat interface powered by WebSockets and REST APIs.',
    openGraph: {
        title: 'Ghast Chat',
        description: 'Real-time chat with conversations, typing indicators, and live updates.',
    },
    metadataBase: new URL('http://localhost:3100'),
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
                {children}
            </body>
        </html>
    )
}
