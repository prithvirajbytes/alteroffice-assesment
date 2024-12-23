const express = require("express");
const  authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/google", async (req, res, next) => {
    authController.googleAuthRedirect(req,res,next)
});
router.get("/google/callback", async (req, res, next) => {
    authController.googleAuth(req,res,next)
});


module.exports = router;
