const Url = require("../model/urls.model");
const Analytics = require("../model/analytics.model");
const geoip = require("geoip-lite");
const requestIp = require("request-ip");
const moment = require("moment");
const {
  getDeviceType,
  getOperatingSystem,
} = require("../utils/helperFunction/helper");
const { getCacheFromRedis, setCacheData } = require("../utils/redis/redis");

const redirectShortUrlService = async (alias, req) => {
  var urlRecord = await getCacheFromRedis(req);
  if (!urlRecord) {
    urlRecord = await Url.findOne({ shortUrl: alias });

    const cacheKey = req.originalUrl;
    await setCacheData(cacheKey, urlRecord);
  }
  if (!urlRecord) {
    throw new Error("Short URL not found");
  }

  const userIp = requestIp.getClientIp(req);
  const geo = geoip.lookup(userIp);

  const device = getDeviceType(req.headers["user-agent"]);
  const os = getOperatingSystem(req.headers["user-agent"]);

  // console.log({
  //   shortUrl: alias,
  //   userAgent: req.headers["user-agent"],
  //   device,
  //   os,
  //   ipAddress: userIp,
  //   geoLocation: geo
  //     ? {
  //         country: geo.country,
  //         region: geo.region,
  //         city: geo.city,
  //       }
  //     : {},
  // });
  const analyticsData = new Analytics({
    shortUrl: alias,
    userAgent: req.headers["user-agent"],
    device,
    os,
    ipAddress: userIp,
    geoLocation: geo
      ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
        }
      : {},
  });

  // Save the analytics data to the database
  await analyticsData.save();

  // Return the long URL for the redirection
  return urlRecord.longUrl;
};

async function getUrlAnalytics(alias) {
  // Initialize the response structure
  const analytics = {
    totalClicks: 0,
    uniqueClicks: 0,
    clicksByDate: [],
    osType: [],
    deviceType: [],
    geoLocation: [],
  };

  // Get the total clicks for the alias
  const totalClicks = await Analytics.countDocuments({ shortUrl: alias });
  analytics.totalClicks = totalClicks;

  const uniqueClicks = await Analytics.distinct("ipAddress", {
    shortUrl: alias,
  });
  analytics.uniqueClicks = uniqueClicks.length;

  const last7Days = moment().subtract(7, "days").toDate();
  const clicksByDate = await Analytics.aggregate([
    { $match: { shortUrl: alias, timestamp: { $gte: last7Days } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  analytics.clicksByDate = clicksByDate;

  const osType = await Analytics.aggregate([
    { $match: { shortUrl: alias } },
    {
      $group: {
        _id: "$os",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        osName: "$_id",
      },
    },
  ]);
  analytics.osType = osType;

  const deviceType = await Analytics.aggregate([
    { $match: { shortUrl: alias } },
    {
      $group: {
        _id: "$device",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        deviceName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);
  analytics.deviceType = deviceType;

  return analytics;
}

const getTopicAnalytics = async (topic) => {
  const shortUrls = await Url.find({ topic });
  const shortUrlsIds = shortUrls.map((url) => url.shortUrl);

  const analytics = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: "$shortUrl",
        totalClicks: { $sum: 1 },
        uniqueClicks: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        shortUrl: "$_id",
        totalClicks: 1,
        uniqueClicks: { $size: "$uniqueClicks" },
        _id: 0,
      },
    },
  ]);

  const totalClicks = analytics.reduce(
    (sum, data) => sum + data.totalClicks,
    0
  );
  const uniqueClicks = analytics.reduce(
    (sum, data) => sum + data.uniqueClicks,
    0
  );

  const clicksByDate = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        clickCount: { $sum: 1 },
      },
    },
    {
      $project: {
        date: "$_id",
        count: "$clickCount",
        _id: 0,
      },
    },
  ]);

  const result = {
    totalClicks,
    uniqueClicks,
    clicksByDate,
    urls: analytics,
  };

  return result;
};

const getOverallAnalytics = async (userId) => {
  const shortUrls = await Url.find({ createdBy: userId });
  const shortUrlsIds = shortUrls.map((url) => url.shortUrl);

  const analytics = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: "$shortUrl",
        totalClicks: { $sum: 1 },
        uniqueClicks: { $addToSet: "$ipAddress" },
        osType: { $addToSet: "$os" },
        deviceType: { $addToSet: "$device" },
      },
    },
    {
      $project: {
        shortUrl: "$_id",
        totalClicks: 1,
        uniqueClicks: { $size: "$uniqueClicks" },
        osType: 1,
        deviceType: 1,
        _id: 0,
      },
    },
  ]);

  const totalUrls = shortUrls.length;
  const totalClicks = analytics.reduce(
    (sum, data) => sum + data.totalClicks,
    0
  );
  const uniqueClicks = analytics.reduce(
    (sum, data) => sum + data.uniqueClicks,
    0
  );

  const clicksByDate = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
        clickCount: { $sum: 1 },
      },
    },
    {
      $project: {
        date: "$_id",
        count: "$clickCount",
        _id: 0,
      },
    },
  ]);

  const osType = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: "$os",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        osName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        _id: 0,
      },
    },
  ]);

  const deviceType = await Analytics.aggregate([
    { $match: { shortUrl: { $in: shortUrlsIds } } },
    {
      $group: {
        _id: "$device",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        deviceName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
        _id: 0,
      },
    },
  ]);

  const result = {
    totalUrls,
    totalClicks,
    uniqueClicks,
    clicksByDate,
    osType,
    deviceType,
  };

  return result;
};
module.exports = {
  redirectShortUrlService,
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
};
