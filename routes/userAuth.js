const notificationModel = require('../models/notification');
const userModel = require('../models/user');
const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config= require('config')
const socket = require("../middlewares/socket")

const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ... (existing code)

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword)
        return res.status(400).send("Passwords Do Not Match");

    const userAlreadyRegistered = await userModel.findOne({ email, role: 'buyer' });

    if (userAlreadyRegistered)
        return res.status(400).send("User Already Registered");

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save the verification token to the user document
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        confirmPassword: hashedPassword, // Note: Store the hashed password for confirmPassword for simplicity
        role: 'buyer',
        verificationToken: verificationToken,
        verificationTokenExpires: Date.now() + 3600000, // 1 hour expiration
    });

    // Send verification email
    const transporter = nodemailer.createTransport({
        // Configure your email service
        service: 'gmail',
        auth: {
            user: "abdullahkhalid1398@gmail.com",
            pass: "nmgychjrljcvjnxq"
        }
      });


        const mailOptions = {
            to: email,
            subject: 'Email Verification',
            html: `<p>Click on the following link to verify your email: <a href="http://localhost:4000/sellers/verify/${verificationToken}">http://localhost:4000/sellers/verify/${verificationToken}</a></p>`,
        };
        
        
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Failed to send verification email");
        }
        console.log(`Email sent: ${info.response}`);
        res.send("User Registered. Please check your email for verification.");
    });
});

// Add a route for handling the verification link
router.get('/verify/:token', async (req, res) => {
    const token = req.params.token;

    const user = await userModel.findOne({
        role:'seller',
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

// Add a route for checking verification status
router.get('/verify-status', async (req, res) => {
    // Extract the user's email from the request (you might use your authentication logic here)
    const userEmail = req.user.email; // Assuming you have a user object in the request
  
    // Find the user by email and check if it's verified
    const user = await userModel.findOne({ email: userEmail });
  
    if (!user) {
      return res.status(404).send("User not found");
    }
  
    res.json({ verified: user.verified });
  });
  

// router.post('/register', async(req,res)=>{
//     const {firstName, lastName , email, password, confirmPassword  } = req.body;
//     if(password!==confirmPassword)
//     return res.status(400).send("Passwords Do Not Match")

//     const userAlreadyRegistered= await userModel.findOne({email , role:'buyer'})
//     if(userAlreadyRegistered)
//     return res.status(400).send("User Already Registered")

//     const hashedPassword = await bcrypt.hash(password,12)
//     const hashedConfirmPassword = await bcrypt.hash(confirmPassword,12)
//     const user = await userModel.create({
//         firstName,
//         lastName,
//         email,
//         password:hashedPassword,
//         confirmPassword:hashedConfirmPassword,
//         role:'buyer'
//     })
//     res.send("User Successfully Registered")
// })

router.post('/login', async (req, res) => {
    console.log(req.body);

    const io = req.io;
    const userSockets = {};

    if (req.body.authType && req.body.authType.toLowerCase() === 'google') {
        const { profile } = req.body;
        console.log("Profile: ", profile);

        try {
            let user = await userModel.findOne({ googleAuth: profile.id, role: 'buyer' });
            console.log("User: ", user);
            
            if (!user) {
                const newUser = await userModel.create({
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    googleAuth: profile.id,
                    role: 'buyer',
                    verified: true
                });

                console.log("USER CREATED: ", newUser)

                const payload = {
                    _id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email
                };

                const token = jwt.sign({ _id: newUser._id }, config.get('JWT_SECRET'));

                return res.send({ token, payload });
            } else {
                const payload = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                };

                const token = jwt.sign({ _id: user._id }, config.get('JWT_SECRET'));

                return res.send({ token, payload });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    }  else {
        const { email, password } = req.body;

        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(400).send("User Is Not Registered");
            }

            if (user.role === 'seller') {
                return res.status(400).send("Not Authorized");
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(400).send("Passwords Do Not Match");
            }

            const payload = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            };

            const token = jwt.sign({ _id: user._id }, config.get('JWT_SECRET'));

            return res.send({ token, payload });
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    }
});




module.exports = router

    
    // const notification = await notificationModel.find({user:user._id})

    // io.on('connection', (socket) => {
    //   console.log('A user connected')
        
    //   socket.on('login',(userId)=>{
    //     userSockets[userId]=socket
    //     console.log(`User ${userId} logged in`)
    //   })
    
    // })