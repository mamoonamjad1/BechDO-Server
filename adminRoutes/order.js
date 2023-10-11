const express = require("express");
const router = express.Router();
const orderModel = require("../models/order");

router.get("/get", async (req, res) => {
const orders =  await orderModel.find()      
.populate("buyer")
.populate("seller")
.populate("products")
.populate("products.category");
res.send(orders);
})



module.exports = router;