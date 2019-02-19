const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next){
    if (!req.user.isAdmin) return res.status(403).send("Access denied! You must be and admin to access this endpoint.");
    next();
}
