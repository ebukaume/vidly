const request = require("supertest");
const {Genre} = require("../../../models/genres");
const User = require("../../../models/users");
const mongoose = require("mongoose");
let server;

describe("/api/genres", () =>{
    beforeEach(async () => {
        server = require("../../../index");
        await Genre.remove({});
    });
    afterEach(async () => {
        await server.close();
        await Genre.remove({});
    });
    
    describe("GET /", () =>{
        it("Should return all genres", async () =>{
            let genre = await new Genre({name: "genre0"}).save();
            genre = await new Genre({name: "genre1"}).save();

            const res = await request(server).get("/api/genres");
            
            expect(res.status).toBe(200);
            // expect(res.body.length).toBe(2);
            expect(res.body.some(v => v.name === "genre0")).toBeTruthy();
            expect(res.body.some(v => v.name === "genre1")).toBeTruthy();
        });
    });

    describe("GET /:id", () =>{
        beforeEach(() =>{server = require("../../../index")});
        afterEach(async () =>{
            await server.close();
            await Genre.remove({});
        });

        it("Should return the genre with the specified ID", async () =>{
            const genre = await new Genre({name: "genre2"}).save();

            const res = await request(server).get(`/api/genres/${genre._id}`);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", genre.name);
        });

        it("Should return status code 404 and 'Genre with the given ID was not found'", async () =>{
            await new Genre({name: "genre1"}).save();

            const newID = new mongoose.Types.ObjectId().toHexString();

            const res = await request(server).get(`/api/genres/${newID}`);
            
            expect(res.status).toBe(404);
            expect(res.body).toEqual({});
        });

        it("Should return status code 400 'Invalid ID'", async () => {
            const res = await request(server).get("/api/genres/1");

            expect(res.status).toBe(400);
        });
    });

    describe("POST /", () =>{
        let name;
        let token;
        
        const exec = () =>{
            return request(server)
                .post("/api/genres")
                .set("x-auth-token", token)
                .send({name});
        };

        beforeEach(() =>{
            token = new User().generateAuthToken();
            name = "genre1";
        });

        it("Should return 401 if client is not logged in", async () =>{
            token = "";

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it("Should return 400 if genre.name is less than 5 characters", async () =>{
            name = "ABCD";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("Should return 400 if name exceeds 50 characters", async () =>{
            name = new Array(52).join("a");

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("Should save to db and return 200 if client is logged in and sent a valid genre", async () =>{
            const res = await exec();
            const genre = await Genre.find({ name });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", "genre1");
            expect(genre[0]).toHaveProperty("name", "genre1");
        });
    });
    
    describe("PUT /:id", () =>{
        let token;
        let name;
        let id;

        beforeEach(() =>{
            id = mongoose.Types.ObjectId().toHexString();
            const user = {
                _id: id,
                isAdmin: true
            };
            token = new User(user).generateAuthToken();
        });
        const exec = () => {
            return request(server)
                .put("/api/genres/"+ id )
                .set("x-auth-token", token)
                .send({name});
        }

        it("should return 402 if client send invalid ID", async () => {
            id = "1";
            
            const res = await exec();

            expect(res.status).toBe(402);
        });

        it("should return 400 if client send invalid genre", async () => {
            name = "a";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return updated genre if successful", async () => {
            const genre = await new Genre({name: "genre1"}).save();

            id = genre._id;
            name = "genre2";

            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body.name).toBe(name);
        });
    });

    describe("DELETE /:id",() =>{
        let id;
        let token;

        beforeEach(() =>{
            id = mongoose.Types.ObjectId().toHexString();
            token = new User({
                id: id,
                isAdmin: true
            }).generateAuthToken();
        });

        const exec = () =>{
            return request(server)
                .delete("/api/genres/"+id)
                .set("x-auth-token", token);
        }

        it("should return 400 if client sends invalid id", async ()=>{
            id = "1";

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("should return 200 if client sends a valid id and genre deleted", async ()=>{
            await new Genre({name: "genre1"}).save();

            const res = await exec();
            const genre = Genre.find({});

            expect(genre).toMatchObject({});
            expect(res.status).toBe(200);
        });
    });
});