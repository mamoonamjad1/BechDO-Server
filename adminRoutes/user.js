const express = require("express");
const router = express.Router();
const userModel = require("../models/user");

router.get("/get", async (req, res) => {
const users =  await userModel.find();
res.send(users);
})
router.get("/get/sellers", async (req, res) => {
const users =  await userModel.find({role:'seller'});
res.send(users);
})
router.get("/get/buyer", async (req, res) => {
const users =  await userModel.find({role:'buyer'});
res.send(users);
})


router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
await userModel.findByIdAndDelete(id)
res.send("Deleted")
})

module.exports = router;