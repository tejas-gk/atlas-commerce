# ---- Build Stage ----
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git make

# Copy go mod files
COPY apps/ghast-chat-service/go.mod ./
COPY apps/ghast-chat-service/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY apps/ghast-chat-service/cmd ./cmd
COPY apps/ghast-chat-service/internal ./internal

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd

# ---- Runtime Stage ----
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8090

# Run the application
CMD ["./main"]
