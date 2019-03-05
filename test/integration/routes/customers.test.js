const request = require("supertest");
const Customer = require("../../../models/customers");
const mongoose = require('mongoose');

describe("/api/customers", ()=>{
    let server;
    let customer;

    beforeEach(async ()=>{
        server = require("../../../index");
        customer = new Customer({
            name: "12345",
            phone: "01234567890",
            isGold: true
        });
        await customer.save();
    });

    afterEach(async ()=>{
        await server.close();
        await Customer.remove({});
    });

    describe("GET /", ()=>{
        it("should return all customers", async () =>{
            const res = await request(server).get("/api/customers");
            
            expect(res.status).toBe(200);
            expect(res.body.some(c => c.name === "12345")).toBeTruthy();
        });
    });

    describe("GET /:id", ()=>{
        let Id;
        beforeEach(() =>{
            Id = customer._id;
        });
        
        it("should return 400 if clients sends invalid ID", async () =>{
            Id = "1";
            const res = await request(server).get("/api/customers/"+Id);
            
            expect(res.status).toBe(400);
        });

        it("should return the customer with the given ID", async () =>{
            const res = await request(server).get("/api/customers/"+Id);
            
            expect(res.status).toBe(200);
            expect(res.body.name).toBe(customer.name);
        });
    });

    describe("POST /", async ()=>{
        let payload;

        beforeEach(() =>{
            payload = {
                name: "New 12345",
                phone: "01234567890",
                isGold: true
            };
        });

        const exec = () =>{
            return request(server)
                    .post("/api/customers")
                    .send(payload);
        }

        it("should return 400 if client sends an invalid customer object", async () =>{
            delete payload.name;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it("should return 200 if client sends a valid customer object", async () =>{            
            const res = await exec();
            
            expect(res.status).toBe(200);
        });

        it("should return the customer object after saving to the DB", async () =>{            
            const res = await exec();
            
            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['name', 'phone', 'isGold']));
        });
    });

    describe("PUT /:id", async ()=>{
        let payload;
        let Id;

        beforeEach(() =>{
            Id = customer._id;
            payload = {
                name: "012345",
                phone: customer.phone,
                isGold: !customer.isGold
            };
        });

        const exec = () =>{
            return request(server)
                    .put("/api/customers/"+Id)
                    .send(payload);
        }

        it("should return 400 if client sends an invalid ID", async () =>{
            Id = "1";

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it("should return 404 if client sends an ID that is not in the DB", async () =>{  
            Id = new mongoose.Types.ObjectId().toHexString();

            const res = await exec();
            
            expect(res.status).toBe(404);
        });

        it("should return 400 if client sends an invalid customer object", async () =>{
            delete payload.name;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it("should return 200 if client sends a invalid customer object and ID", async () =>{
            const res = await exec();
            
            expect(res.status).toBe(200);
        });

        it("should return the updated customer object after saving to the DB", async () =>{            
            const res = await exec();
            
            const updatedCustomer = await Customer.findOne({name: "012345"});

            expect(updatedCustomer).toBeDefined();
        });
    });

    describe("DELETE /:id", async ()=>{
        let payload;
        let Id;

        beforeEach(() =>{
            Id = customer._id.toHexString();
            payload = {
                name: "012345",
                phone: customer.phone,
                isGold: !customer.isGold
            };
        });

        const exec = () =>{
            return request(server)
                    .delete("/api/customers/"+Id)
                    .send(payload);
        }

        it("should return 400 if client sends an invalid ID", async () =>{
            Id = "1";

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it("should return {} if client sends an ID that is not in the DB", async () =>{  
            Id = new mongoose.Types.ObjectId().toHexString();

            const res = await exec();
            
            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({});
        });

        it("should return the deleted customer object after deleting from the DB", async () =>{            
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body._id).toEqual(Id);
        });
    });
});