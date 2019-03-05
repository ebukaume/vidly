const express = require("express");
const {validateGenre, validateObjectId} = require("../helpers/validator");
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
    
    const genre = await Genre.findById(req.params.id).select("-__v");
    if (!genre) return res.status(404).send("Genre with the given ID was not found");
    
    res.send(genre);
});

router.post("/", auth, async (req, res) => {
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let genre = new Genre({name: req.body.name});
    genre = await genre.save();

    res.send(genre);
});

router.put("/:id", [auth, admin], async (req, res) => {
    const valRes = validateObjectId({id: req.params.id});
    if (valRes.error) return res.status(402).send("Invalid ID");
    
    const {error} = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    const genre = await Genre.findOneAndUpdate({_id:req.params.id},{name: req.body.name},{new: true});

    res.send(genre);
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    
    const genre = await Genre.findByIdAndDelete(req.params.id)
    res.send(genre);
});


module.exports = router;