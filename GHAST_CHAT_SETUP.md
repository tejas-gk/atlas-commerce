# Ghast Chat - Comprehensive Setup Guide

This project now includes **Ghast Chat**, a WhatsApp-like real-time messaging system built with modern technologies.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           Ghast Chat Architecture                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐                                   │
│  │              │    WebSocket                       │
│  │ ghast-chat   │◄────────────────►┌──────────────┐  │
│  │    web       │                  │ ghast-chat   │  │
│  │ (Next.js)    │                  │   service    │  │
│  └──────────────┘   REST API       │   (Golang)   │  │
│         │         ◄────────────────►│              │  │
│         │                            └──────────────┘  │
│         │                                   ▲          │
│         │                                   │          │
│         └───────────────────────────────────┼──────────┘
│                                             │
│                         ▼
│              ┌──────────────────────┐
│              │   PostgreSQL 16      │
│              │  (Chat Data)         │
│              └──────────────────────┘
│
│              ┌──────────────────────┐
│              │   Redis 7            │
│              │  (Message Queue)     │
│              └──────────────────────┘
│
└─────────────────────────────────────────────────────┘
```

## Service Details

### Ghast Chat Service (Go Backend)

**Location**: `apps/ghast-chat-service`

- **Language**: Go 1.21
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Protocol**: HTTP + WebSockets
- **Port**: 8090

**Features**:

- Real-time messaging via WebSockets
- One-on-one and group conversations
- Message queueing with Redis for reliability
- REST API for conversation/message management
- PostgreSQL for persistent storage with migrations
- Automatic database schema setup

**API Endpoints**:

```
GET  /api/v1/conversations               - List user conversations
POST /api/v1/conversations/create        - Create new conversation
GET  /api/v1/messages?conversation_id=X - Get messages
POST /api/v1/messages/send               - Send message
WS   /ws?user_id=X&conversation_id=Y   - WebSocket connection
```

**Environment Variables**:

```
DATABASE_URL=postgres://user:pass@postgres:5432/ghast_chat
REDIS_URL=redis://redis:6379
PORT=8090
```

### Ghast Chat Web (Frontend)

**Location**: `apps/ghast-chat-web`

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Port**: 3100

**Features**:

- Modern, responsive chat UI
- Real-time message updates
- Conversation management
- WebSocket integration
- Tailwind CSS styling

**Environment Variables**:

```
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8090
```

## Running Locally

### With Docker Compose (Recommended)

Development environment:

```bash
docker-compose -f docker-compose.dev.yml up -d postgres redis ghast-chat-service ghast-chat-web
```

Access the application:

- Chat Web: http://localhost:3100
- API: http://localhost:8090

### Manual Setup

1. **Start PostgreSQL**:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ghast_chat \
  -p 5432:5432 \
  postgres:16-alpine
```

2. **Start Redis**:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

3. **Build and Run Ghast Chat Service**:

```bash
cd apps/ghast-chat-service
go build -o ghast-chat-service ./cmd
DATABASE_URL="postgres://postgres:postgres@localhost:5432/ghast_chat" \
REDIS_URL="redis://localhost:6379" \
./ghast-chat-service
```

4. **Build and Run Ghast Chat Web**:

```bash
cd apps/ghast-chat-web
pnpm install
pnpm dev
```

## Database Schema

The service automatically creates these tables on startup:

- **users**: Chat user profiles
- **conversations**: Chat conversations (1-on-1 or groups)
- **conversation_members**: Membership tracking
- **messages**: Chat messages with status tracking

## WebSocket Message Format

```json
{
  "type": "message",
  "action": "new",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "content": "Hello",
    "type": "text",
    "status": "sent",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentication

Currently uses `X-User-ID` header for authentication. In production:

1. Integrate with existing auth service
2. Verify JWT tokens
3. Implement proper authorization checks

## Scaling Considerations

- **Horizontal Scaling**: Use Redis for session management, load balance with Nginx
- **Database**: PostgreSQL can be scaled with read replicas
- **Real-time**: WebSocket can be scaled with Redis pub/sub
- **Message Queue**: Redis queues prevent message loss

## Development Workflow

### Adding New Endpoints (Backend)

1. Define models in `internal/models/models.go`
2. Add handler in `internal/handlers/chat.go`
3. Register route in `cmd/main.go`

### Adding Features (Frontend)

1. Create components in `src/components/`
2. Add hooks in `src/hooks/`
3. Update state in `src/lib/store.ts`

## Production Deployment

1. **Build images**:

```bash
docker build -f apps/ghast-chat-service/Dockerfile -t ghast-chat-service:latest .
docker build -f apps/ghast-chat-web/Dockerfile -t ghast-chat-web:latest .
```

2. **Push to registry**:

```bash
docker tag ghast-chat-service:latest ${DOCKER_USERNAME}/ghast-chat-service:latest
docker push ${DOCKER_USERNAME}/ghast-chat-service:latest
```

3. **Deploy with docker-compose**:

```bash
docker-compose -f docker-compose.production.yml up -d
```

## Troubleshooting

### Service won't start

- Check PostgreSQL connection: `psql -h localhost -U postgres -d ghast_chat`
- Check Redis connection: `redis-cli ping`
- Check logs: `docker logs ghast-chat-service`

### WebSocket connection fails

- Verify port 8090 is accessible
- Check CORS settings in middleware
- Verify frontend API URL configuration

### Migrations fail

- Ensure database is running before service start
- Check database permissions
- Review migration logs in container

## Next Steps

- Implement media sharing (images, files)
- Add message encryption
- Implement typing indicators
- Add read receipts
- User presence indicators
- Message search functionality
- Rich message formatting
