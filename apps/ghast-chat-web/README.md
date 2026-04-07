# Ghast Chat Web

A modern web frontend for real-time chat built with Next.js, React, and TypeScript.

## Features

- Real-time messaging with WebSocket integration
- Conversation management
- Message history
- Responsive UI with Tailwind CSS
- Zustand for state management

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Main chat page
│   └── layout.tsx          # Root layout
├── components/
│   ├── MessageInput.tsx   # Message input component
│   ├── MessageList.tsx    # Messages display
│   └── ConversationList.tsx # Conversations sidebar
├── hooks/
│   └── useWebSocket.ts    # WebSocket hook
├── lib/
│   ├── api.ts            # API client
│   └── store.ts          # Zustand store
├── types/
│   └── index.ts          # TypeScript definitions
└── globals.css           # Global styles
```

## Environment Variables

- `NEXT_PUBLIC_CHAT_API_URL` - Chat service API URL (default: http://localhost:8090)

## Running

```bash
pnpm dev     # Development
pnpm build   # Production build
pnpm start   # Production server
```

## Port

Default: 3100
