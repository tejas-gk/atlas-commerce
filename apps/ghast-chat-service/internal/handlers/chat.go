package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/atlas/ghast-chat-service/internal/models"
	"github.com/atlas/ghast-chat-service/internal/websocket"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type ChatHandler struct {
	db        *sql.DB
	redis     *redis.Client
	wsManager *websocket.Manager
}

func NewChatHandler(db *sql.DB, redis *redis.Client, wsManager *websocket.Manager) *ChatHandler {
	return &ChatHandler{
		db:        db,
		redis:     redis,
		wsManager: wsManager,
	}
}

func (h *ChatHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	senderID := r.Header.Get("X-User-ID")
	if senderID == "" {
		http.Error(w, "Missing X-User-ID header", http.StatusUnauthorized)
		return
	}

	if req.Type == "" {
		req.Type = "text"
	}

	messageID := uuid.New().String()
	now := time.Now()

	_, err := h.db.Exec(
		`INSERT INTO messages (id, conversation_id, sender_id, content, type, status, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, 'sent', $6, $7)`,
		messageID, req.ConversationID, senderID, req.Content, req.Type, now, now,
	)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Failed to save message", http.StatusInternalServerError)
		return
	}

	message := &models.Message{
		ID:             messageID,
		ConversationID: req.ConversationID,
		SenderID:       senderID,
		Content:        req.Content,
		Type:           req.Type,
		Status:         "sent",
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": message,
	})
}

func (h *ChatHandler) GetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	conversationID := r.URL.Query().Get("conversation_id")
	if conversationID == "" {
		http.Error(w, "Missing conversation_id parameter", http.StatusBadRequest)
		return
	}

	rows, err := h.db.Query(
		`SELECT m.id, m.conversation_id, m.sender_id, m.content, m.type, m.status, m.created_at, m.updated_at, u.id, u.email, u.name, u.created_at, u.updated_at
		 FROM messages m
		 JOIN users u ON m.sender_id = u.id
		 WHERE m.conversation_id = $1
		 ORDER BY m.created_at DESC
		 LIMIT 100`,
		conversationID,
	)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		var sender models.User
		var senderCreatedAt, senderUpdatedAt time.Time

		err := rows.Scan(
			&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Content, &msg.Type, &msg.Status, &msg.CreatedAt, &msg.UpdatedAt,
			&sender.ID, &sender.Email, &sender.Name, &senderCreatedAt, &senderUpdatedAt,
		)
		if err != nil {
			log.Printf("Row scan error: %v", err)
			continue
		}

		sender.CreatedAt = senderCreatedAt
		sender.UpdatedAt = senderUpdatedAt
		msg.Sender = sender
		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"messages": messages,
	})
}

func (h *ChatHandler) CreateConversation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateConversationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	creatorID := r.Header.Get("X-User-ID")
	if creatorID == "" {
		http.Error(w, "Missing X-User-ID header", http.StatusUnauthorized)
		return
	}

	conversationID := uuid.New().String()
	now := time.Now()

	_, err := h.db.Exec(
		`INSERT INTO conversations (id, name, description, is_group, creator_id, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		conversationID, req.Name, req.Description, req.IsGroup, creatorID, now, now,
	)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Failed to create conversation", http.StatusInternalServerError)
		return
	}

	// Add creator and members to conversation
	memberIDs := append(req.MemberIDs, creatorID)
	for _, memberID := range memberIDs {
		role := "member"
		if memberID == creatorID {
			role = "admin"
		}

		_, err := h.db.Exec(
			`INSERT INTO conversation_members (id, conversation_id, user_id, role, joined_at)
			 VALUES ($1, $2, $3, $4, $5)`,
			uuid.New().String(), conversationID, memberID, role, now,
		)
		if err != nil {
			log.Printf("Database error adding member: %v", err)
		}
	}

	conversation := &models.Conversation{
		ID:          conversationID,
		Name:        req.Name,
		Description: req.Description,
		IsGroup:     req.IsGroup,
		CreatorID:   creatorID,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"conversation": conversation,
	})
}

func (h *ChatHandler) GetConversations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		http.Error(w, "Missing X-User-ID header", http.StatusUnauthorized)
		return
	}

	rows, err := h.db.Query(
		`SELECT c.id, c.name, c.description, c.is_group, c.creator_id, c.created_at, c.updated_at
		 FROM conversations c
		 JOIN conversation_members cm ON c.id = cm.conversation_id
		 WHERE cm.user_id = $1
		 ORDER BY c.updated_at DESC`,
		userID,
	)
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, "Failed to fetch conversations", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var conversations []models.Conversation
	for rows.Next() {
		var conv models.Conversation
		err := rows.Scan(&conv.ID, &conv.Name, &conv.Description, &conv.IsGroup, &conv.CreatorID, &conv.CreatedAt, &conv.UpdatedAt)
		if err != nil {
			log.Printf("Row scan error: %v", err)
			continue
		}
		conversations = append(conversations, conv)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":       true,
		"conversations": conversations,
	})
}
