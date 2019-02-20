const express = require("express");
const User = require("../models/users");
const {validateUserNew} = require("../middleware/validator");
const auth = require("../middleware/auth");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const router = express.Router();


router.get("/profile", auth, async(req, res) => {
    const user = await User.findById(req.user._id).select("-password -__v");
    res.send(user);
});

router.post("/", async (req, res) => {
    const {error} = validateUserNew(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let user = await User.findOne({email: req.body.email});
    if (user) return res.status(400).send(`User with email: '${req.body.email}' already exists`);
    user = new User(_.pick(req.body,["name","email","password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    const token = user.generateAuthToken();
    res.header("x-auth-token", token).send(_.pick(user, ["_id", "name", "email"]));
});


module.exports = router;