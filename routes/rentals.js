const express = require("express");
const Rental = require("../models/rentals");
const Movie = require("../models/movies");
const Customer = require("../models/customers");
const {validateRental, validateObjectId} = require("../helpers/validator");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Fawn = require("../helpers/fawn");
const router = express.Router();


router.get("/", async (req, res) => {
    const rentals = await Rental.find().sort("-dateOut").select("-__v");
    
    res.send(rentals);
});

router.get("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    
    const rental = await Rental.findById(req.params.id).select("-__v");
    
    res.send(rental);
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
    Fawn
        .save("rentals", rental)
        .update("movies", {_id: movie._id},{$inc: {numberInStock: -1}})
        .run();
    
    res.send(rental);
});

router.delete("/:id", [auth, admin], async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    
    const rental = await Rental.findByIdAndDelete(req.params.id);
    
    res.send(rental);
});

module.exports = router;