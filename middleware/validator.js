const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const genreSchema = {
    name: Joi.string().min(5).max(50).required()
};

const customerSchema = {
    isGold: Joi.boolean(),
    name: Joi.string().min(1).max(50).required(),
    phone: Joi.string().min(11).max(20).required()
};

const movieSchema = {
    title: Joi.string().min(1).max(50).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0),
    dailyRentalRate: Joi.number().min(0)
};

const rentalSchema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
}

function validateGenre(genre){
    return Joi.validate(genre,genreSchema);
}

function validateCustomer(customer){
    return Joi.validate(customer,customerSchema);
}

function validateMovie(movie){
    return Joi.validate(movie,movieSchema);
}

function validateRental(rental){
    return Joi.validate(rental,rentalSchema);
}


module.exports = {
    validateGenre, 
    validateCustomer, 
    validateMovie, 
    validateRental
};

