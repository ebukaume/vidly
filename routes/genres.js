const express = require("express");
const {validateGenre, validateObjectId} = require("../middleware/validator");
const {Genre} = require("../models/genres");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();


router.get("/", async (req, res) => {
    res.send(await Genre.find().sort("name").select("-__v"));
});

router.get("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    res.send(await Genre.findById(req.params.id).select("-__v"));
});

router.post("/", auth, async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let genre = new Genre({name: req.body.name});
    res.send(await genre.save());
});

router.put("/:id", [auth, admin], async (req, res) => {
    const {err} = validateObjectId({id: req.params.id});
    if (err) return res.status(400).send("Invalid ID");
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    res.send(await Genre.findByIdAndUpdate(req.params.id,{name: req.body.name},{new: true}));
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    res.send(await Genre.findByIdAndDelete(req.params.id));
});


module.exports = router;