const jwt = require("jsonwebtoken");
const config = require("config");


module.exports = function (req, res, next){
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access denied. You need to be logged in to access this endpoint.");
    
    const isValid = jwt.verify(token, config.get("jwtPrivateKey"));
    if (!isValid) return  res.status(400).send("Invalid Token!");
    
    req.user = isValid;
    next();
}
