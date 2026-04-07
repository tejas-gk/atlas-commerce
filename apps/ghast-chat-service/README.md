# Ghast Chat Service

A real-time chat service built with Go, PostgreSQL, WebSockets, and Redis for queueing.

## Features

- Real-time messaging with WebSockets
- Support for one-on-one and group conversations
- Message queuing with Redis
- PostgreSQL database for persistence
- RESTful API endpoints
- Scalable architecture isolated from the main monorepo

## Project Structure

```
.
├── cmd/
│   └── main.go              # Application entry point
├── internal/
│   ├── database/            # Database connection and migrations
│   ├── handlers/            # HTTP request handlers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Data models
│   └── websocket/           # WebSocket management
├── migrations/              # Database migration files
├── go.mod
├── go.sum
└── Dockerfile
```

## API Endpoints

### Conversations

- `GET /api/v1/conversations` - Get user's conversations
- `POST /api/v1/conversations/create` - Create a new conversation

### Messages

- `POST /api/v1/messages/send` - Send a message
- `GET /api/v1/messages?conversation_id=...` - Get conversation messages

### WebSocket

- `WS /ws?user_id=...&conversation_id=...` - Real-time message streaming

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Server port (default: 8090)

## Building

```bash
go build -o ghast-chat-service ./cmd
```

## Running

```bash
./ghast-chat-service
```

## Development

```bash
go run ./cmd/main.go
```
