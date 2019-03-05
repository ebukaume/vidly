const express = require("express");
const User = require("../models/users");
const {validateUserAuth} = require("../helpers/validator");
const bcrypt = require("bcrypt");
const router = express.Router();


router.post("/", async (req, res) => {
    const {error} = validateUserAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send("Invalid email or password");
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    res.set("x-auth-token",token).send(token);
});


module.exports = router;