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
  const nodemailer = require("nodemailer");
  const crypto = require("crypto");


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
  
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 12);
  
    // Save the verification token to the user document
    const user = await userModel.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
      confirmPassword: hashedPassword, // Store the hashed password for confirmPassword for simplicity
      image: url + "/images/" + req.file.filename,
      role: "seller",
      verificationToken: verificationToken,
      verificationTokenExpires: Date.now() + 3600000, // 1 hour expiration
    });
  
// Send verification email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: "abdullahkhalid1398@gmail.com",
      pass: "nmgychjrljcvjnxq"
  }
});

  
    const mailOptions = {
        to: email,
        subject: 'Email Verification',
        html: `<p>Click on the following link to verify your email: <a href="http://localhost:4000/seller/verify/${verificationToken}">http://localhost:4000/seller/verify/${verificationToken}</a></p>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Failed to send verification email");
        }
        console.log(`Email sent: ${info.response}`);
        res.send("Seller Registered. Please check your email for verification.");
    });
});

// Add a route for handling the verification link
router.get('/verify/:token', async (req, res) => {
    const token = req.params.token;
  
    const user = await userModel.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }, // Check if the token is still valid
    });
  
    if (!user) {
        return res.status(400).send("Invalid or expired token");
    }
  
    // Update the user document to mark email as verified
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  
    res.send("Email verified successfully. You can now log in.");
});



router.post("/login", async (req, res) => {
  console.log("Req", req.body);
  const { email, password } = req.body;

  const user = await userModel.findOne({ email, role: "seller" });
  if (!user) {
    return res.status(400).send("User Is Not Registered");
  }
  if(user.verified===false){
    return res.status(400).send("Please Verify Your Email First");
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


router.put('/edit/profile/:id', upload.single("image"),async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, phoneNumber, address,password,confirmPassword , image } = req.body;
  const id = req.params.id;

  try {
      const user = await userModel.findById(id);

      if (!user) {
          return res.status(404).send("User not found");
      }

      if (firstName) {
          user.firstName = firstName;
      }

      if (lastName) {
          user.lastName = lastName;
      }

      if (email && email !== user.email) {
        // If the email is being updated, send a verification email
        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiration
  
        // Send verification email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: "abdullahkhalid1398@gmail.com",
            pass: "nmgychjrljcvjnxq"
          }
        });
  
        const mailOptions = {
          to: email,
          subject: 'Email Verification',
          html: `<p>Click on the following link to verify your email: <a href="http://localhost:4000/seller/verify/${verificationToken}">http://localhost:4000/seller/verify/${verificationToken}</a></p>`,
        };
  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(error);
            return res.status(500).send("Failed to send verification email");
          }
          console.log(`Email sent: ${info.response}`);
        });
  
        // Update the user's email and reset verification status
        user.email = email;
        user.isEmailVerified = false;
      }

      if (phoneNumber) {
          user.phoneNumber = phoneNumber;
      }

      if (address) {
          user.address = address;
      }

      if(password && confirmPassword){
        const hashedPassword = await bcrypt.hash(password, 12);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);

        user.password = hashedPassword;
        user.confirmPassword = hashedConfirmPassword;

        await user.save();
        return res.send("Password Updated Successfully");
      }
      if(image){
        const url = req.protocol + "://" + req.get("host");
        user.image = url + "/images/" + req.file.filename;
      }


      await user.save();

      return res.send(user);
  } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;





  // router.post("/register", upload.single("image"), async (req, res) => {
  //   const {
  //     firstName,
  //     lastName,
  //     address,
  //     email,
  //     phoneNumber,
  //     password,
  //     confirmPassword,
  //   } = req.body;
  
  //   const url = req.protocol + "://" + req.get("host");
  
  //   if (password !== confirmPassword)
  //     return res.status(400).send("Passwords Do Not Match");
  
  //   const userAlreadyRegistered = await userModel.findOne({
  //     email: email,
  //     role: "seller",
  //   });
  
  //   if (userAlreadyRegistered)
  //     return res.status(400).send("User Already Registered");
  
  //   const hashedPassword = await bcrypt.hash(password, 12);
  //   const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 12);
  
  //   const user = await userModel.create({
  //     firstName,
  //     lastName,
  //     email,
  //     phoneNumber,
  //     address,
  //     password: hashedPassword,
  //     confirmPassword: hashedConfirmPassword,
  //     image: url + "/images/" + req.file.filename,
  //     role: "seller",
  //   });
  
  //   res.send("User Successfully Registered");
  // });
  