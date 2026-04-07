package websocket

import (
	"context"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/atlas/ghast-chat-service/internal/models"
	"github.com/gorilla/websocket"
)

type Manager struct {
	rooms      map[string]*Room
	roomsMutex sync.RWMutex
	upgrader   websocket.Upgrader
}

type Room struct {
	ID           string
	clients      map[*Client]bool
	clientsMutex sync.RWMutex
	broadcast    chan *models.WebSocketMessage
	register     chan *Client
	unregister   chan *Client
	closeOnce    sync.Once
	closed       chan struct{}
}

type Client struct {
	ID   string
	conn *websocket.Conn
	room *Room
	send chan *models.WebSocketMessage
	done chan struct{}
}

func NewManager() *Manager {
	return &Manager{
		rooms: make(map[string]*Room),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// Allow all origins for now. In production, implement proper CORS checks
				return true
			},
		},
	}
}

func (m *Manager) HandleConnection(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	conversationID := r.URL.Query().Get("conversation_id")

	if userID == "" || conversationID == "" {
		http.Error(w, "Missing user_id or conversation_id", http.StatusBadRequest)
		return
	}

	conn, err := m.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		ID:   userID,
		conn: conn,
		send: make(chan *models.WebSocketMessage, 256),
		done: make(chan struct{}),
	}

	room := m.getOrCreateRoom(conversationID)
	client.room = room

	room.register <- client

	go client.writePump()
	go client.readPump()
}

func (m *Manager) getOrCreateRoom(roomID string) *Room {
	m.roomsMutex.Lock()
	defer m.roomsMutex.Unlock()

	if room, exists := m.rooms[roomID]; exists {
		return room
	}

	room := &Room{
		ID:         roomID,
		clients:    make(map[*Client]bool),
		broadcast:  make(chan *models.WebSocketMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		closed:     make(chan struct{}),
	}

	m.rooms[roomID] = room
	go room.run()

	return room
}

func (m *Manager) Shutdown(ctx context.Context) {
	m.roomsMutex.RLock()
	roomsList := make([]*Room, 0, len(m.rooms))
	for _, room := range m.rooms {
		roomsList = append(roomsList, room)
	}
	m.roomsMutex.RUnlock()

	for _, room := range roomsList {
		room.clientsMutex.RLock()
		for client := range room.clients {
			client.conn.Close()
		}
		room.clientsMutex.RUnlock()
	}
}

func (r *Room) run() {
	for {
		select {
		case <-r.closed:
			return

		case client := <-r.register:
			r.clientsMutex.Lock()
			r.clients[client] = true
			r.clientsMutex.Unlock()
			log.Printf("Client %s joined room %s", client.ID, r.ID)

		case client := <-r.unregister:
			r.clientsMutex.Lock()
			if _, exists := r.clients[client]; exists {
				delete(r.clients, client)
				close(client.send)
			}
			r.clientsMutex.Unlock()
			log.Printf("Client %s left room %s", client.ID, r.ID)

		case message := <-r.broadcast:
			r.clientsMutex.RLock()
			for client := range r.clients {
				select {
				case client.send <- message:
				default:
					// Client's send channel is full, close it
					go func(c *Client) {
						r.unregister <- c
					}(client)
				}
			}
			r.clientsMutex.RUnlock()
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.room.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetReadLimit(512000) // 512KB max message size

	for {
		var message models.WebSocketMessage
		err := c.conn.ReadJSON(&message)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			return
		}

		message.Timestamp = time.Now()
		c.room.broadcast <- &message
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(54 * time.Second)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			c.conn.WriteJSON(message)

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
