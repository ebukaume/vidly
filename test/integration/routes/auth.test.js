const request = require("supertest");
const User = require("../../../models/users");
const bcrypt = require("bcrypt");

describe("POST /api/auth", () =>{
    let server;
    let payload;
    let user;

    beforeEach(async () =>{
        server = require("../../../index");

        const plainPassword = "12345678";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword,salt);

        user = new User({
            name: '12345',
            email: 'email@test.com',
            password: hashedPassword
        });
        await user.save();

        payload = {email: user.email, password: plainPassword}
    });

    afterEach(async () =>{
        await server.close();
        await User.remove({});
    })

    const exec = () =>{
        return request(server)
                .post("/api/auth")
                .send(payload)
    }
    it("should return 400 if email is not provided", async () =>{
        delete payload.email;

        const res = await exec();

        expect(res.status).toBe(400);
    });

    
    it("should return 400 if password is not provided", async () =>{
        delete payload.password;

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 400 if email is not found in DB", async () =>{
        payload.email = "noInDB@test.com";

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 400 if password is wrong", async () =>{
        payload.password = "wrongpassword";

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it("should return 200 if email and password are found in the DB", async () =>{
        const res = await exec();

        expect(res.status).toBe(200);
    });
});