const {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} = require("../services/analytics.service");
const { setCacheData } = require("../utils/redis/redis");

exports.getAnalytics = async (req, res) => {
  const { alias } = req.params;

  try {
    const analytics = await getUrlAnalytics(alias);
    //cache
    const cacheKey = req.originalUrl;
    await setCacheData(cacheKey, analytics);
    return res.json(analytics);
  } catch (error) {
    next(error);
  }
};
exports.getOverallAnalyticsController = async (req, res, next) => {
  try {
    const userId = req?.user?.id;
    console.log("overall----------------------------------------")
    const analytics = await getOverallAnalytics(userId);
    //cache
    const cacheKey = req.originalUrl;
    await setCacheData(cacheKey, analytics);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.getTopicAnalyticsController = async (req, res, next) => {
  try {
    const { topic } = req.params;
    console.log(topic);
    const analytics = await getTopicAnalytics(topic);
    const cacheKey = req.originalUrl;
    await setCacheData(cacheKey, analytics);
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};
