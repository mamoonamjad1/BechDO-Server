const express = require('express');
const router = express.Router();
const Part = require('../models/parts'); // Import your Part model

// Save a Part in a Category
router.post('/save/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const part = new Part({
      category: id,
      name: req.body.name,
    });
    const savedPart = await part.save();
    res.status(201).json(savedPart);
  } catch (error) {
    res.status(500).json({ error: 'Could not save the part.' });
  }
});

// Fetch Parts of a Category
router.get('/fetch/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parts = await Part.find({ category: id });
    res.status(200).json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch parts.' });
  }
});

module.exports = router;
