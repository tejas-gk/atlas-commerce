package models

import "time"

// User represents a chat user
type User struct {
	ID        string    `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// Conversation represents a chat conversation
type Conversation struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	IsGroup     bool      `json:"is_group" db:"is_group"`
	CreatorID   string    `json:"creator_id" db:"creator_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	Members     []User    `json:"members,omitempty"`
}

// Message represents a chat message
type Message struct {
	ID             string    `json:"id" db:"id"`
	ConversationID string    `json:"conversation_id" db:"conversation_id"`
	SenderID       string    `json:"sender_id" db:"sender_id"`
	Content        string    `json:"content" db:"content"`
	Type           string    `json:"type" db:"type"`     // text, image, file
	Status         string    `json:"status" db:"status"` // sent, delivered, read
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
	Sender         User      `json:"sender,omitempty"`
}

// ConversationMember represents membership in a conversation
type ConversationMember struct {
	ID             string    `json:"id" db:"id"`
	ConversationID string    `json:"conversation_id" db:"conversation_id"`
	UserID         string    `json:"user_id" db:"user_id"`
	Role           string    `json:"role" db:"role"` // admin, member
	JoinedAt       time.Time `json:"joined_at" db:"joined_at"`
}

// WebSocketMessage represents a WebSocket message payload
type WebSocketMessage struct {
	Type      string                 `json:"type"`
	Action    string                 `json:"action"`
	Data      map[string]interface{} `json:"data"`
	Timestamp time.Time              `json:"timestamp"`
}

// SendMessageRequest is the request body for sending a message
type SendMessageRequest struct {
	ConversationID string `json:"conversation_id"`
	Content        string `json:"content"`
	Type           string `json:"type"` // text, image, file (default: text)
}

// CreateConversationRequest is the request body for creating a conversation
type CreateConversationRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	IsGroup     bool     `json:"is_group"`
	MemberIDs   []string `json:"member_ids"`
}
