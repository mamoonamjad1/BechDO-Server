const express = require("express");
const router = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const upload = require("../middlewares/multer");
 const stripe = require("stripe")(
    "sk_test_51NsLBADMF5rirMzQtW4DwVuFBqz4jhhf2j0m8yoVxbCKdhuxM7Zxx8rcMvtP8FviigPEHF9Y10SqY05giTrUazzU00Nf9RXF5t"
  );

  router.post("/register", upload.single("image"), async (req, res) => {
    const {
      firstName,
      lastName,
      address,
      email,
      phoneNumber,
      password,
      confirmPassword,
    } = req.body;
  
    const url = req.protocol + "://" + req.get("host");
  
    if (password !== confirmPassword)
      return res.status(400).send("Passwords Do Not Match");
  
    const userAlreadyRegistered = await userModel.findOne({
      email: email,
      role: "seller",
    });
  
    if (userAlreadyRegistered)
      return res.status(400).send("User Already Registered");
  
    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);
  
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
      confirmPassword: hashedConfirmPassword,
      image: url + "/images/" + req.file.filename,
      role: "seller",
    });
  
    res.send("User Successfully Registered");
  });
  

router.post("/login", async (req, res) => {
  console.log("Req", req.body);
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, role: "seller" });
  if (!user) {
    return res.status(400).send("User Is Not Registered");
  }
  const hasedPassword = await bcrypt.compare(password, user.password);
  if (!hasedPassword) {
    return res.status(400).send("Passwords Do Not Match");
  }
  console.log("eee", user);
  const token = jwt.sign(
    {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      email: user.email,
      phoneNumber: user.phoneNumber,
      image: user.image,
    },
    config.get("JWT_SELLER")
  );

  res.send({ token, firstName: user.firstName });
});

module.exports = router;