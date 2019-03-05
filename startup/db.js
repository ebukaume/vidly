const mongoose = require("mongoose");
const winston = require("winston");
const config = require("config");

module.exports = function(){
    const dbUri = config.get("db");
    mongoose.set("useNewUrlParser", true);
    mongoose.set("useCreateIndex", true);
    mongoose.connect(dbUri)
        .then(() => winston.info(`Connected to ${dbUri}...`));    
}