const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        minlength: 2,
        maxlength: 255,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 255,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 2048,
        trim: true
    },
    isAdmin:{
        type: Boolean,
        default: false
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({
        _id: this._id,
        isAdmin: this.isAdmin
    }, config.get("jwtPrivateKey"));
    return token;
}

module.exports = mongoose.model("User", userSchema);