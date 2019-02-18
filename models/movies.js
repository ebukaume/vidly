const mongoose = require("mongoose");

const {genreSchema} = require("../models/genres");

module.exports = mongoose.model("Movie", new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255
    },
    genre: {
        type: genreSchema,
        required: true
    },
    numberInStock: {
        required: true,
        type: Number,
        default: 0,
        min: 0
    },
    dailyRentalRate: {
        required: true,
        type: Number,
        default: 0,
        min: 0
    }
}));
