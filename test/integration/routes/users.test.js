const User = require("../../../models/users");
const request = require("supertest");

describe("/api/users",() =>{
    let server;
    let token;
    let newUser;
    let user;
    let payload;

    beforeEach(async ()=>{
        server = require("../../../index");

        newUser = {
            name: "New12345",
            email: "newtest@email.com",
            password: "12345678"
        };

        user = {
            name: "12345",
            email: "test@email.com",
            password: "12345678"
        };
        
        const userPayload = new User(user);
        token = userPayload.generateAuthToken();
        await userPayload.save();
        payload = newUser;
    });

    afterEach(async ()=>{
        await server.close();
        await User.remove({});
    });

    const exec = () =>{
        return request(server)
            .post("/api/users")
            .set("x-auth-token", token)
            .send(payload);
    };

    describe("POST /profile",()=>{
        it("should return 401 if client is not logged in", async()=>{
            token = "";

            const res = await request(server)
                .get("/api/users/profile")
                .set("x-auth-token", token);
            
            expect(res.status).toBe(401);
        });

        it("should return 200 if client is logged in", async()=>{
            const res = await request(server)
                .get("/api/users/profile")
                .set("x-auth-token", token);
            
            expect(res.status).toBe(200);
        });

        it("should return user's detail if client is logged in", async()=>{
            const res = await request(server)
                .get("/api/users/profile")
                .set("x-auth-token", token);
            
            expect(res.body.name).toBe(user.name);
        });

        describe("POST /", ()=>{

        });
    });

    describe("POST /", () =>{
        beforeEach(()=>{
            token = "";
    });

        it("it should return 400 if client sends an invalid user object", async()=>{
            payload = {};

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("it should return 400 if client user already exist", async()=>{
            payload = user;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it("it should return 200 if client sends a valid user object", async()=>{
            const res = await exec();
            
            expect(res.status).toBe(200);
        });
    });

});