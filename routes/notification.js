const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const productModel = require("../models/product");
const notificationModel = require("../models/notification");

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const notifications = await notificationModel.find({ user: id });
        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const clear = await notificationModel.deleteMany({ user: id });
        res.status(200).send("DELETED");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/delete/single/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const clearOne = await notificationModel.findByIdAndDelete(id);
        res.status(200).send("DELETED");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
