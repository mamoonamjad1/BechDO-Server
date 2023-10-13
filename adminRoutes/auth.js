const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const userModel = require("../models/user");

router.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const admin = await userModel.findOne({ email });
  if (!admin) return res.status(400).send("NOT ADMIN");

  const hashedPassword = await bcrypt.compare(password, admin.password);
  if (!hashedPassword) {
    return res.status(400).send("Passwords Do Not Match");
  }

  const secretKey = config.get("ADMIN"); 

  // Provide a payload and options (if needed) as the first and third arguments
  const payload = { user: { id: admin.id } }; // Adjust the payload as needed
  const options = { expiresIn: 3600 }; // Optional, adjust to your needs

  jwt.sign(payload, secretKey, options, (error, token) => {
    if (error) {
      throw error;
    }
    res.json({ token });
  });
});

module.exports = router;
