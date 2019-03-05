const express = require("express");
const Customer = require("../models/customers");
const {validateCustomer, validateObjectId} = require("../helpers/validator");
const router = express.Router();


router.get("/", async (req, res) => {
    res.send(await Customer.find().sort("name").select("-__v"));
});

router.get("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if(error) return res.status(400).send("Invalid ID");
    
    res.send(await Customer.findById(req.params.id).select("-__v"));
});

router.post("/", async (req, res) => {
    const {error} = validateCustomer(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    let customer = new Customer(req.body);
    customer = await customer.save()
    
    res.send(customer);
});

router.put("/:id", async (req, res) => {
    const validationResult = validateObjectId({id: req.params.id});
    if (validationResult.error) return res.status(400).send("Invalid ID");
    
    let customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send(`A customer with ID: ${req.params.id} was not found`);
    
    const {error} = validateCustomer(req.body);
    if(error) return res.status(400).send(error.message);

    customer = await Customer.findOneAndUpdate({_id: req.params.id},req.body,{new:true});
    
    res.send(customer);
});

router.delete("/:id", async (req, res) => {
    const {error} = validateObjectId({id: req.params.id});
    if (error) return res.status(400).send("Invalid ID");
    
    res.send(await Customer.findByIdAndDelete(req.params.id));
});

module.exports = router;