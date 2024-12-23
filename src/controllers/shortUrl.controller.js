const Task = require("../model/analytics.model.js");
const { redirectShortUrlService } = require("../services/analytics.service.js");
const { createShortUrlService } = require("../services/url.service.js");
const { setCacheData, getCacheFromRedis } = require("../utils/redis/redis.js");

exports.createShortUrl = async (req, res, next) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.id;
    const result = await createShortUrlService(
      longUrl,
      customAlias,
      topic,
      userId
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.redirectShortUrl = async (req, res, next) => {
  try {
    const { alias } = req.params;
   
    const longUrl = await redirectShortUrlService(alias, req);
  
    const isSwagger = String(req.get("Referer"))?.includes("api-docs");
    if (isSwagger) {
      res.status(200).json({
        redirectUrl: longUrl,
        message: "Redirect URL generated",
      });
      return;
    }

    res.redirect(302, longUrl);
  } catch (error) {
    next(error);
  }
};
