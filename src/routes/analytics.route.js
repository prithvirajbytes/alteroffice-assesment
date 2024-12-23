const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  getTopicAnalyticsController,
  getOverallAnalyticsController,
} = require("../controllers/analytics.controller");
router.get("/topic/:topic", getTopicAnalyticsController);
router.get("/overall", getOverallAnalyticsController);
router.get("/:alias", getAnalytics);
module.exports = router;
