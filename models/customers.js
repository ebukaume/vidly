const mongoose = require("mongoose");

module.exports = mongoose.model("customer", new mongoose.Schema({
    isGold:{
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50
    },
    phone: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 20
    },
}));