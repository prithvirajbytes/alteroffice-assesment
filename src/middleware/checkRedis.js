const { CustomError } = require("../utils/errors/error");
const { getCacheFromRedis, setCacheData } = require("../utils/redis/redis");

const checkRedis = async (req, res, next) => {
  try {
    const data = await getCacheFromRedis(req);
    if (!data) {
      console.log("not it cache redis");
      next();
    } else {
      return res.json(data);
    }
  } catch (error) {
    console.log(new CustomError(error));
    next();
  }
};

module.exports = { checkRedis };
