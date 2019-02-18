const express = require("express");
const Movies = require("../models/movies");
const {Genre} = require("../models/genres");
const validator = require("../middleware/validator");
const router = express.Router();

// Routes
router.get("/", async (req, res) => {
    res.send(await Movies.find().sort("name").select("-__v").sort("title"));
});

router.get("/:id", async (req, res) => {
    try{res.send(await Movies.findById(req.params.id).select("-__v"))}
    catch(err){res.status(404).send(`Customer with the ID: ${req.params.id} was not found!`)}
});

router.post("/", async (req, res) => {
    const {error} = validator.validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid genre sent");
    let movie = new Movies({
        title: req.body.title,
        genre:{
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });
    try{res.send(await movie.save())}
    catch (err){res.status(400).send(err.message)}
});

router.put("/:id", async (req, res) => {
    if(!(await Movies.findById(req.params.id))) return res.status(404).send(`A customer with ID: ${req.params.id} was not found`);
    const {error} = validator.validateMovie(req.body);
    if(error) res.status(400).send(error.message);
    try{res.send(await Movies.findOneAndUpdate({_id: req.params.id},req.body,{new:true}))}
    catch(err) {res.status(400).send(err.message)}
});

router.delete("/:id", async (req, res) => {
    try{res.send(await Movies.findByIdAndDelete(req.params.id))}
    catch(err){res.status(400).send(err.message)}
});

module.exports = router;