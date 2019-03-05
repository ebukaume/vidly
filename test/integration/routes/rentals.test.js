const request = require("supertest");
const Rental = require("../../../models/rentals");
const User = require("../../../models/users");
const Customer = require("../../../models/customers");
const {Genre} = require("../../../models/genres");
const Movie = require("../../../models/movies");
const mongoose = require("mongoose");

describe("/api/rentals", ()=>{
    let server;
    let adminToken;
    let token;
    let rental;
    let customer;
    let movie;
    let Id;
    let payload;
    let customerId;
    let genreId;
    let movieId;
    let genre;

    beforeEach(async ()=>{
        server = require("../../../index");

        token = new User().generateAuthToken();
        adminToken = new User({isAdmin:true}).generateAuthToken();
        

        Id = mongoose.Types.ObjectId().toHexString();
        genreId = mongoose.Types.ObjectId().toHexString();
        movieId = mongoose.Types.ObjectId().toHexString();
        customerId = mongoose.Types.ObjectId().toHexString();

        payload = {customerId, movieId};

        genre = new Genre({name: "genre1"});
        await genre.save();       

        customer = new Customer({
            _id: customerId,
            name: "12345",
            phone: "01234567890"
        });
        await customer.save();

        movie = new Movie({
            _id: movieId,
            title: "12345",
            genre:{
                _id: genreId,
                name: genre.name
            },
            numberInStock: 500,
            dailyRentalRate: 2.99
        });
        await movie.save();

        rental = new Rental({
            _id: Id,
            customer:{
                name: "12345",
                phone: "01234567890"
            },
            movie:{
                title: "movie1",
                dailyRentalRate: 1.99
            }
        });
        await rental.save();
    });

    afterEach(async() =>{
        await Customer.remove({});
        await Rental.remove({});
        await Genre.remove({});
        await Movie.remove({});
        await User.remove({});
        await server.close();
    });

    describe("GET /", ()=>{
        it("should return 200", async ()=>{
            const res = await request(server).get("/api/rentals");

            expect(res.status).toBe(200);
        });

        it("should return all rentals", async ()=>{
            const res = await request(server).get("/api/rentals");

            expect(res.body.some(r => r.dateOut !== undefined)).toBeTruthy();
            expect(res.body.some(r => r._id !== undefined)).toBeTruthy();
        });
    });

    describe("GET /:id", async() =>{
        const exec = () =>{
            return request(server)
                .get("/api/rentals/"+Id)
        };
        it("should return 400 if client sends an invalid ID", async()=>{
            Id = "1";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 200 if client sends a valid ID", async()=>{
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should return a valid rental object whose ID was sent", async()=>{
            const res = await exec();

            expect(res.body._id).toBe(Id);
        });
    });

    describe("POST /", async() =>{
        const exec = () =>{
            return request(server)
                .post("/api/rentals")
                .set("x-auth-token", token)
                .send(payload)
        };
        it("should return 401 if client is not logged in", async()=>{
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("should return 400 if client sends an invalid rental object", async()=>{
            payload = {};

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if client did not send a customerId", async()=>{
            delete payload.customerId;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if client did not send a movieId", async()=>{
            delete payload.movieId;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if client sends an invalid customerId", async()=>{
            payload.customerId = mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if client sends an invalid movieId", async()=>{
            payload.movieId = mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 400 if movie in stock is 0", async()=>{
            await Movie.findByIdAndUpdate(movieId,{numberInStock: 0});
            
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 200 if client sends a valid rental object", async()=>{
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it("should return a valid rental object after saving to the DB", async()=>{
            const res = await exec();

            expect(res.body.customer._id).toBe(customerId);
            expect(res.body.movie._id).toBe(movieId);
        });
    });

    describe("DELETE /:id",()=>{
        const exec = ()=>{
            return request(server)
                .delete("/api/rentals/"+Id)
                .set("x-auth-token", adminToken);
        }

        it("should return 401 if client is not logged in", async ()=>{
            adminToken = "";

            const res = await exec();

            expect(res.status).toBe(401)
        });

        it("should return 403 if client is logged in but not an admin", async ()=>{
            adminToken = token;
            
            const res = await exec();

            expect(res.status).toBe(403)
        });

        it("should return 400 if admin sends an invalid ID", async ()=>{
            Id = "1";
            
            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 200 if admin sends a valid ID", async ()=>{
            const res = await exec();

            expect(res.status).toBe(200)
        });

        it("should return the rental object after deleting the DB", async ()=>{
            const res = await exec();

            expect(res.body._id).toBe(Id)
        });
    });
});