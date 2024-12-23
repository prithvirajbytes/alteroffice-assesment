const express = require("express");
const router = express();

const authRoute = require("./auth.route");
const shortUrlRoute = require("./shortUrl.route");
const analyticsRoute = require("./analytics.route");
const userRoute = require("./user.route");

const authMiddleware = require("../middleware/authMiddlware");
const { checkRedis } = require("../middleware/checkRedis");

router.use("/api/shorten", authMiddleware, shortUrlRoute);
router.use("/api/analytics", authMiddleware, analyticsRoute);
router.use("/api/user", authMiddleware, userRoute);

router.use("/auth", authRoute);

module.exports = router;
