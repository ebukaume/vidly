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

const newUserSchema = {
    name: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(8).max(255).required()
}

const authUserSchema = {
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(8).max(255).required()
}

const objectIdSchema = {
    id: Joi.objectId().min(24).required()
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

function validateUserNew(user){
    return Joi.validate(user,newUserSchema);
}

function validateUserAuth(user){
    return Joi.validate(user,authUserSchema);
}

function validateObjectId(objectId){
    return Joi.validate(objectId, objectIdSchema);
}

module.exports = {
    validateGenre, 
    validateCustomer, 
    validateMovie, 
    validateRental,
    validateUserNew,
    validateUserAuth,
    validateObjectId
};

