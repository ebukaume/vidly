const admin = require("../../../middleware/admin");

describe("admin middleware",() =>{
    it("should call next if user is admin", ()=>{
        const req = {
            user:{
                isAdmin: true
            }
        };
        
        const res = {}
        
        const next = jest.fn()

        admin(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});