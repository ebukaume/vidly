const request = require("supertest");
const mongoose = require("mongoose");
const Rental = require("../../../models/rentals");
const Movie  = require("../../../models/movies");
const User  = require("../../../models/users");
const moment = require("moment");

describe("POST /api/returns", () =>{
    let server;
    let rental;
    let token;
    let payload;
    let movie;
    const numberOfMovies = 10;
    const customerId = mongoose.Types.ObjectId().toHexString();
    let movieId;

    beforeEach(async () =>{
        server = require("../../../index");
        movie = new Movie({
            title: "Movie1",
            genre:{
                name: "genre1"
            },
            numberInStock: numberOfMovies,
            dailyRentalRate: 2
        });
        await movie.save();

        movieId = movie._id;

        rental = new Rental({
            customer:{
                _id: customerId,
                name: "12345",
                isGold: true,
                phone: "01234567890"
            },
            movie:{
                _id: movieId,
                title: "12345",
                dailyRentalRate: 2
            },
            dateOut: moment().add(-7, "days").toDate()
        });
        await rental.save();

        token = new User().generateAuthToken();
        payload = {customerId, movieId};
    });

    afterEach(async () =>{
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    const exec = () =>{
        return request(server)
                .post("/api/returns")
                .set("x-auth-token", token)
                .send(payload);
    };

    it("should return 401 if client is not logged in", async () =>{
        token = "";

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () =>{
        delete payload.customerId;

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () =>{
        delete payload.movieId;

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 404 if no rental found for this customerId/movieId", async () =>{
        payload = {
            customerId: mongoose.Types.ObjectId().toHexString(),
            movieId: mongoose.Types.ObjectId().toHexString()
        }

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it("should return 400 if rental has already been processed", async () =>{
        rental.dateReturned = new Date;
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 200 if request is valid", async () =>{
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it("should set dateReturned if input is valid", async () =>{
        const res = await exec();
        
        const record = await Rental.lookup(customerId,movieId)

        const diff = new Date() - record.dateReturned;

        expect(diff).toBeLessThan(5 * 1000);
        expect(res.status).toBe(200);
    });

    it("should set rentalFee if input is valid", async () =>{
        await rental.save();

        const res = await exec();

        const record = await Rental.lookup(customerId,movieId)

        expect(record.rentalFee).toBe(7 * record.movie.dailyRentalRate);
        expect(res.status).toBe(200);
    });

    it("should increase movie in stock after processing return if input is valid", async () =>{
        const res = await exec();

        const updatedMovie = await Movie.findById(payload.movieId);

        expect(updatedMovie.numberInStock).toBe(numberOfMovies + 1);
        expect(res.status).toBe(200);
    });

    it("should return the rental if input is valid", async () =>{
        const res = await exec();
        
        expect(Object.keys(res.body))
            .toEqual(expect.arrayContaining([
                "dateReturned",
                "rentalFee",
                "customer",
                "dateOut",
                "movie"]));
    });

});
