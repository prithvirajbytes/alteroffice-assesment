const jwt = require("jsonwebtoken");
const { CustomError } = require("../utils/errors/error");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log(new CustomError(error))
       next(new CustomError("invalid token",400))
    }
};

module.exports = authMiddleware;
