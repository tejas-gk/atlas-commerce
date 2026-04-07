package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/atlas/ghast-chat-service/internal/database"
	"github.com/atlas/ghast-chat-service/internal/handlers"
	"github.com/atlas/ghast-chat-service/internal/middleware"
	"github.com/atlas/ghast-chat-service/internal/websocket"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../../.env")

	db, err := database.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	redisClient, err := database.InitRedis(os.Getenv("REDIS_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Close()

	err = database.RunMigrations(db)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	wsManager := websocket.NewManager()
	mux := http.NewServeMux()

	logging := middleware.Logging
	cors := middleware.CORS

	mux.HandleFunc("/ws", cors(logging(wsManager.HandleConnection)))

	chatHandler := handlers.NewChatHandler(db, redisClient, wsManager)
	mux.HandleFunc("/api/v1/messages", cors(logging(chatHandler.GetMessages)))
	mux.HandleFunc("/api/v1/messages/send", cors(logging(chatHandler.SendMessage)))
	mux.HandleFunc("/api/v1/conversations", cors(logging(chatHandler.GetConversations)))
	mux.HandleFunc("/api/v1/conversations/create", cors(logging(chatHandler.CreateConversation)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting Ghast Chat Service on %s\n", server.Addr)

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	wsManager.Shutdown(ctx)

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
