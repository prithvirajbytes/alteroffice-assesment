const { createClient } = require("redis");

let redisClient;
const PORT = process.env.REDIS_PORT;
const HOST = process.env.REDIS_HOST;
async function initializeRedisClient() {
  if (!redisClient) {
    // Configuration
    const config = {
      // url: process.env.REDIS_CONNECTION_STRING,
      socket: {
        host: HOST,
        port: PORT,
        reconnectStrategy: (retries) => {
          console.log(`Attempting to reconnect to Redis (${retries} retries)`);
          if (retries >= 2) {
            return new Error("Too many retries");
          }
          return Math.min(retries * 50, 2000); // Reconnect after 50ms, 100ms, 150ms, up to 2000ms
        },
      },
    };

    // Create Redis client
    redisClient = createClient(config);

    // Error handling
    redisClient.on("error", (err) => console.error("Redis Client Error", err));

    // Connect to Redis
    await redisClient.connect().catch(console.error);
  }

  return redisClient;
}

module.exports = initializeRedisClient;
