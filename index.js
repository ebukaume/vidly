const winston = require("winston");
const app = require("express")();

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();


const port = process.env.PORT || 3000;

const server = app.listen(port, () => {winston.info(`Vidly server started on port ${port}`)});

module.exports = server;