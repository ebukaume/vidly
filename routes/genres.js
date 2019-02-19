const {validateGenre} = require("../middleware/validator");
const {Genre} = require("../models/genres");
const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();


router.get("/", async (req, res) => {
    res.send(await Genre.find().sort("name").select("-__v"));
});

router.get("/:id", async (req, res) => {
    try{res.send(await Genre.findById(req.params.id).select("-__v"));}
    catch(err){res.status(400).send("Genre with the given ID was not found");}
});

router.post("/", auth, async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let genre = new Genre({name: req.body.name});
    try{res.send(await genre.save());}
    catch(err){res.status(400).send(err.message)}
});

router.put("/:id", [auth, admin], async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    try {res.send(await Genre.findByIdAndUpdate(req.params.id,{name: req.body.name},{new: true}));}
    catch(err) {res.status(400).send(err)}
});

router.delete("/:id", [auth, admin], async (req, res) => {
    try{res.send(await Genre.findByIdAndDelete(req.params.id));}
    catch(err) {res.status(404).send(err)}
});


module.exports = router;