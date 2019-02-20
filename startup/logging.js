require("express-async-errors");
const winston = require("winston");

module.exports = function(){
    winston.exceptions.handle(
        new winston.transports.File({filename: "uncaughtExceptions.log"}),
        new winston.transports.Console({colorize: true, prettyPrint: true})
        );
    process.on("unhandledRejection", (ex) =>{
        throw ex;
    });
    winston.add(new winston.transports.File({filename: "logfile.log"}))
    winston.add(new winston.transports.Console({colorize: true, prettyPrint: true}));
}