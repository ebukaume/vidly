const request = require("supertest");
const server = require("../../../index");

describe("root", ()=>{
    describe("GET /", ()=>{
        it("should return 200",async () =>{
            const res = await request(server).get("/");

            expect(res.status).toBe(200);
        });
    });
});