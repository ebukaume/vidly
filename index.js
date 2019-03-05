const winston = require("winston");
const app = require("express")();

require("./startup/logging")();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();


const port = process.env.PORT || 3000;


// Comment this section when testing
app.listen(port, () => {winston.info(`Vidly server started on port ${port}`)});


// Uncomment this section when testing
// module.exports = app.listen(port, () => {winston.info(`Vidly server started on port ${port}`)});