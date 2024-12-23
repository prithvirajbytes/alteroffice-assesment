const express = require("express");
const router = express.Router();
const shortUrlController = require("../controllers/shortUrl.controller");
const rateLimiter = require("../middleware/ratelimiter");
const { checkRedis } = require("../middleware/checkRedis");
// router.get("/", getHabits);
router.post("/", rateLimiter, shortUrlController.createShortUrl);
router.get("/:alias", shortUrlController.redirectShortUrl);
module.exports = router;
