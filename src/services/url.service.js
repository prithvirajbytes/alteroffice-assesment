const shortid = require("shortid");
const URL = require("../model/urls.model");
const { CustomError } = require("../utils/errors/error");

const createShortUrlService = async (longUrl, customAlias, topic, userId) => {
  if (!longUrl || !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(longUrl)) {
    throw new CustomError("Invalid URL format", 400);
  }

  const shortUrl = customAlias || shortid.generate();

  const existingUrl = await URL.findOne({ shortUrl });
  if (existingUrl) {
    throw new Error("Alias already taken, please choose another one.", 400);
  }

  const newUrl = new URL({
    longUrl,
    shortUrl,
    topic,
    createdBy: userId,
    createdAt: new Date(),
  });

  await newUrl.save();

  return {
    shortUrl: `${process.env.BASE_URL}/${shortUrl}`,
    createdAt: newUrl.createdAt,
  };
};

module.exports = { createShortUrlService };
