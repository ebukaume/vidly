const Fawn = require("fawn");
const mongoose = require("mongoose");

Fawn.init(mongoose);

module.exports = new Fawn.Task()