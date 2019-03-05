const request = require("supertest")
const Movie = require("../../../models/movies");
const mongoose = require("mongoose");
const User = require("../../../models/users");
const {Genre} = require("../../../models/genres");

describe("/api/movies", ()=>{
    let server;
    let movie;

    beforeEach(async () =>{
        server = require("../../../index");
        movie = new Movie({
            title: "12345",
            genre:{
                name: "genre1"
            },
            numberInStock: 10,
            dailyRentalRate: 1.99
        });
        await movie.save();
    });

    afterEach(async ()=>{
        await server.close();
        await Movie.remove({});
    });

    describe("GET /", ()=>{
        it("should return 200", async ()=>{
            const res = await request(server).get("/api/movies");

            expect(res.status).toBe(200);
        });
    });

    describe("GET /:id", async ()=>{
        let Id;

        beforeEach(()=>{
            Id = movie._id.toHexString();
        });
        const exec = () =>{
            return request(server).get("/api/movies/"+Id)
        }

        it("should return 400 if client sends an invalid ID", async ()=>{
            Id = "1";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 200 and {} if client sends a valid ID but not found in the DB", async ()=>{
            Id = new mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({});
        });

        it("should return 200 and valid movie object if client sends a valid ID it was found in the DB", async ()=>{
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body._id).toBe(Id);
        });
    });

    describe("POST /",() =>{
        let token;
        let payload;
        let genre;

        beforeEach( async ()=>{
            token =  new User().generateAuthToken();

            genre = new Genre({name:"genre1"});
            await genre.save();

            payload = {
                title: "movie1",
                genreId: genre._id,
                numberInStock: 20,
                dailyRentalRate: 2.99
            }
        });

        afterEach(async ()=>{
            await server.close();
            await Movie.remove({});
            await Genre.remove({});
        });

        const exec = () =>{
            return request(server)
                    .post("/api/movies")
                    .set("x-auth-token", token)
                    .send(payload);
        }
        
        it("should return 401 if client is not authenticated", async ()=>{
            token = "";

            const res = await exec();

            expect(res.status).toBe(401)
        });

        it("should return 400 if client sends an invalid movie object", async ()=>{
            delete payload.title;

            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 400 if client sends a genreId that is not in the DB", async ()=>{
            payload.genreId = new mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 200 if client sends a valid movie object and genreId", async ()=>{
            const res = await exec();

            expect(res.status).toBe(200)
        });

        it("should return the movie after saving", async ()=>{
            const res = await exec();

            expect(res.body.title).toBe(payload.title);
        });
    });

    describe("PUT /:id", ()=>{
        let token;
        let payload;
        let genre;
        let Id;

        beforeEach( async ()=>{
            token =  new User().generateAuthToken();

            genre = new Genre({name:"genre1"});
            await genre.save();

            movie = new Movie({
                title: "12345",
                genre:{
                    name: "genre1"
                },
                numberInStock: 10,
                dailyRentalRate: 1.99
            });
            await movie.save();

            payload = {
                title: "movie1",
                genreId: genre._id,
                numberInStock: 20,
                dailyRentalRate: 2.99
            }
            Id = movie._id;
        });

        afterEach(async ()=>{
            await server.close();
            await Movie.remove({});
            await Genre.remove({});
        });

        const exec = () =>{
            return request(server)
                    .put("/api/movies/"+Id)
                    .set("x-auth-token", token)
                    .send(payload);
        }

        it("should return 401 if client is not authenticated", async ()=>{
            token = "";

            const res = await exec();

            expect(res.status).toBe(401)
        });

        it("should return 400 if client is sends an invalid movieId", async ()=>{
            Id = "1";

            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 400 if client is sends an invalid movie object", async ()=>{
            payload.genreId = "1";

            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 404 if client is sends a valid movieId that is not in the DB", async ()=>{
            Id = new mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(404)
        });

        it("should return 200 if client is sends a valid movieId that is in the DB", async ()=>{
            const res = await exec();

            expect(res.status).toBe(200)
        });

        it("should return updated movie object after saving to the DB", async ()=>{
            const res = await exec();

            expect(res.body.title).toBe(payload.title);
        });
    });
    
    describe("DELETE /:id", ()=>{
        let token;
        let Id;

        beforeEach( async ()=>{
            token =  new User().generateAuthToken();

            genre = new Genre({name:"genre1"});
            await genre.save();

            movie = new Movie({
                title: "12345",
                genre:{
                    name: "genre1"
                },
                numberInStock: 10,
                dailyRentalRate: 1.99
            });
            await movie.save();

            Id = movie._id;
        });

        afterEach(async ()=>{
            await server.close();
            await Movie.remove({});
            await Genre.remove({});
        });

        const exec = () =>{
            return request(server)
                    .delete("/api/movies/"+Id)
                    .set("x-auth-token", token)
        }

        it("should return 401 if client is not authenticated", async ()=>{
            token = "";

            const res = await exec();

            expect(res.status).toBe(401)
        });

        it("should return 400 if client is sends an invalid movieId", async ()=>{
            Id = "1";

            const res = await exec();

            expect(res.status).toBe(400)
        });

        it("should return 200 if client is sends a valid movieId that is in the DB", async ()=>{
            const res = await exec();

            expect(res.status).toBe(200)
        });

        it("should return updated movie object after deleting to the DB", async ()=>{
            const res = await exec();

            expect(res.body.title).toBe(movie.title);
        });
    });
});