const express = require("express");
const Customer = require("../models/customers");
const {validateCustomer} = require("../middleware/validator");
const router = express.Router();

// Routes
router.get("/", async (req, res) => {
    res.send(await Customer.find().sort("name").select("-__v"));
});

router.get("/:id", async (req, res) => {
    try{res.send(await Customer.findById(req.params.id).select("-__v"))}
    catch(err){res.status(400).send(`Customer with the ID: ${req.params.id} was not found!`)}
});

router.post("/", async (req, res) => {
    const {error} = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let customer = new Customer(req.body);
    try{res.send(await customer.save())}
    catch (err){res.status(400).send(err.message)}
});

router.put("/:id", async (req, res) => {
    if(!(await Customer.findById(req.params.id))) return res.status(404).send(`A customer with ID: ${req.params.id} was not found`);
    const {error} = validateCustomer(req.body);
    if(error) res.status(400).send(error.message);
    try{res.send(await Customer.findOneAndUpdate({_id: req.params.id},req.body,{new:true}))}
    catch(err) {res.status(400).send(err.message)}
});

router.delete("/:id", async (req, res) => {
    try{res.send(await Customer.findByIdAndDelete(req.params.id))}
    catch(err){res.status(400).send(err.message)}
});

module.exports = router;