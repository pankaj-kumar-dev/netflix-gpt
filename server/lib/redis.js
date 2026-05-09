const { createClient } = require("redis");

let client = null;
let connected = false;

if (process.env.REDIS_URL) {
  client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err.message));
  client
    .connect()
    .then(() => {
      connected = true;
      console.log("Redis connected");
    })
    .catch((err) => console.error("Redis connection failed:", err.message));
}

const cache = {
  get: async (key) => {
    if (!connected) return null;
    try {
      return await client.get(key);
    } catch {
      return null;
    }
  },
  set: async (key, value, ttlSeconds = 3600) => {
    if (!connected) return;
    try {
      await client.set(key, value, { EX: ttlSeconds });
    } catch {}
  },
  isAvailable: () => connected,
};

module.exports = cache;
