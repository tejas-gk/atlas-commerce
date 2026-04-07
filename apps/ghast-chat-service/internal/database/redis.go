package database

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

func InitRedis(redisURL string) (*redis.Client, error) {
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: defaultRedisAddr(redisURL),
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return client, nil
}

func defaultRedisAddr(url string) string {
	// Parse redis://host:port format or use default
	if url == "" {
		return "localhost:6379"
	}
	return url[8:] // Remove "redis://" prefix
}

// QueueMessage queues a message in Redis
func QueueMessage(client *redis.Client, key string, message string, expiry time.Duration) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return client.LPush(ctx, key, message).Err()
}

// GetQueuedMessages retrieves messages from Redis queue
func GetQueuedMessages(client *redis.Client, key string, count int64) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := client.LRange(ctx, key, 0, count-1).Result()
	if err != nil && err != redis.Nil {
		return nil, err
	}
	return res, nil
}

// DeleteQueuedMessage removes a message from Redis queue
func DeleteQueuedMessage(client *redis.Client, key string, message string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return client.LRem(ctx, key, 1, message).Err()
}
