import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL

if (!redisUrl) {
  console.warn("REDIS_URL is not set. Redis will attempt default connection.")
}

const redis = new Redis(redisUrl || "redis://localhost:6379")

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message)
})

export default redis
