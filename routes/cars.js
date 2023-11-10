const express = require('express');
const router = express.Router();


const CarMake = require('../models/carMake'); // Import the CarMake model
const Variant = require('../models/variant'); // Import the Variant model

// Add a new carMake
router.post('/carMake/add', async (req, res) => {
    try {
        const { name } = req.body;
        const carMake = new CarMake({ name });
        const savedCarMake = await carMake.save();
        res.json(savedCarMake);
    } catch (error) {
        res.status(500).json({ error: 'Could not add carMake' });
    }
});

// Fetch all carMakes
router.get('/carMakes', async (req, res) => {
    try {
        const carMakes = await CarMake.find();
        res.json(carMakes);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch carMakes' });
    }
});

// Add a new variant for a specific carMake
router.post('/variant/add/:id', async (req, res) => {
    try {
        const{id} = req.params;
        const { name } = req.body;
        const variant = new Variant({ name, carMake: id });
        const savedVariant = await variant.save();
        res.json(savedVariant);
    } catch (error) {
        res.status(500).json({ error: 'Could not add variant' });
    }
});

// Fetch variants for a specific carMake
router.get('/variants/:id', async (req, res) => {
    try {
        const {id} = req.params;
        console.log(id);
        const variants = await Variant.find({ carMake: id });
        res.json(variants);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch variants' });
    }
});

module.exports = router;


