const express = require("express");
const router = express.Router();
const { getUser } = require("../controllers/user.controller")
// router.get("/", getHabits);
router.get("/", getUser);


module.exports = router;
