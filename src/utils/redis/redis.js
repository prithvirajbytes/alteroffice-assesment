const initializeRedisClient = require("../../config/redis");

async function getCacheFromRedis(req, res, next) {
  return new Promise(async (resolve, reject) => {
    try {
      const redisClient = await initializeRedisClient();
      const cacheKey = req.originalUrl;
      const cachedData = await redisClient.get(cacheKey);
      console.log("cacheKey", cacheKey);
      if (cachedData) {
        console.log("\x1b[33m%s\x1b[0m", "getting from redis");
        resolve(JSON.parse(cachedData));
      } else {
        resolve(null);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function setCacheData(key, data, expirationTime = null) {
  try {
    const redisClient = await initializeRedisClient();

    await redisClient.set(key, JSON.stringify(data), "EX", expirationTime); // Cache for 1 hour by default

    console.log(`key:${key} - stored in redis . `);
  } catch (error) {
    console.log("redis is not active : ", error.message)
  }
}

module.exports = { getCacheFromRedis, setCacheData };
