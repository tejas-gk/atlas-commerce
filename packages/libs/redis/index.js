const Redis = require("ioredis");

const createTestRedisStub = () => {
  const store = new Map();

  return {
    async get(key) {
      return store.has(key) ? store.get(key) : null;
    },
    async set(key, value) {
      store.set(key, value);
      return "OK";
    },
    async del(...keys) {
      let deleted = 0;
      for (const key of keys) {
        if (store.delete(key)) {
          deleted += 1;
        }
      }
      return deleted;
    },
  };
};

const redis =
  process.env.NODE_ENV === "test"
    ? createTestRedisStub()
    : new Redis(
        process.env.REDIS_URL ||
          "rediss://default:AcUfAAIncDFlNzEyMjM4MGFhMjQ0MjUwYWUwZDM1OGQyODE5ZjZiM3AxNTA0NjM@relieved-ewe-50463.upstash.io:6379"
      );

module.exports = redis;
module.exports.default = redis;
