const express = require("express");
const Rental = require("../models/rentals");
const Movie = require("../models/movies");
const Customer = require("../models/customers");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const {validateRental, validateObjectId} = require("../middleware/validator");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const router = express.Router();

//Initialize Fawn
Fawn.init(mongoose);


router.get("/", async (req, res) => {
    res.send(await Rental.find().sort("-dateOut").select("-__v"));
});

router.get("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    res.send(await Rental.findById(req.params.id).select("-__v"));
});

router.post("/", auth, async (req, res) => {
    const {error} = validateRental(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send("Invalid customer");
    const movie = await Movie.findById(req.body.movieId);
    if (!movie) return res.status(400).send("Invalid movie");
    if (movie.numberInStock === 0) return res.status(400).send("Movie is out of stock");
    let rental = new Rental({
        customer:{
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie:{
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
    //Transaction-like option {2 phase commit} [Removed try-catch block]
    new Fawn.Task()
        .save("rentals", rental)
        .update("movies", {_id: movie._id},{$inc: {numberInStock: -1}})
        .run();
    res.send(rental);
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    res.send(await Rental.findByIdAndDelete(req.params.id));
});

module.exports = router;