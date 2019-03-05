const express = require("express");
const Movies = require("../models/movies");
const {Genre} = require("../models/genres");
const {validateMovie, validateObjectId} = require("../helpers/validator");
const auth = require("../middleware/auth");
const router = express.Router();


router.get("/", async (req, res) => {
    res.send(await Movies.find().sort("name").select("-__v").sort("title"));
});

router.get("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");

    res.send(await Movies.findById(req.params.id).select("-__v"));
});

router.post("/", auth, async (req, res) => {
    const {error} = validateMovie(req.body);
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
    movie = await movie.save();

    res.send(movie);
});

router.put("/:id", auth, async (req, res) => {
    const validationResult = validateObjectId({id: req.params.id});
    if (validationResult.error) return res.status(400).send("Invalid ID");
    
    const {error} = validateMovie(req.body);
    if(error) res.status(400).send(error.message);

    const movie = await Movies.findById(req.params.id);
    if(!movie) return res.status(404).send(`Movie with ID: ${req.params.id} was not found`);
    
    const updatedMovie = await Movies.findOneAndUpdate({_id: req.params.id},req.body,{new:true})
    res.send(updatedMovie);
});

router.delete("/:id", auth, async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");

    const movie = await Movies.findByIdAndDelete(req.params.id);
    res.send(movie);
});

module.exports = router;