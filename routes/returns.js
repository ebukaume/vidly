const express = require("express");
const {validateRental} = require("../helpers/validator");
const auth = require("../middleware/auth");
const Rental = require("../models/rentals");
const Movie = require("../models/movies");
const Fawn = require("../helpers/fawn");
const router = express.Router();


router.post("/", auth, async (req, res) =>{
    const {error} = validateRental(req.body);
    if (error) return res.status(400).send("customerId/movieID is required!");
    
    const rental = await Rental.lookup( req.body.customerId, req.body.movieId)
    if (!rental) return res.status(404).send("No rental not found");

    if (rental.dateReturned) return res.status(400).send("Return already processed");
    
    rental.return();

    Fawn
        .save("rentals", rental)
        .update("movies", {_id: rental.movie._id}, {$inc: {numberInStock: 1}})
        .run();

    return res.send(rental);
});


module.exports = router;