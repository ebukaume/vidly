const mongoose = require("mongoose");
const moment = require("moment");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    isGold: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        minlength: 11,
        maxlength: 22,
        required: true
    }
});

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 255
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    }
});

const rentalSchema = new mongoose.Schema({
    customer: {
        type: customerSchema,
        required: true
    },
    movie: {
        type: movieSchema,
        required: true
    },
    dateOut: {
        type: Date,
        required: true,
        default: new Date
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
    return this.findOne({
        "customer._id": customerId,
        "movie._id": movieId
    });
}

rentalSchema.methods.return = function(){
    this.dateReturned = new Date();

    const rentalDays = moment().diff(this.dateOut, "days");
    this.rentalFee = rentalDays * this.movie.dailyRentalRate; 
}

module.exports = mongoose.model("Rental", rentalSchema);


