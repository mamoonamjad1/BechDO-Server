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
            type: "OAUTH2",
            user: "admin@altcabs.com",
            serviceClient: "104350620386538614175",
            privateKey:
              "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrQ8wh9/onYtj+\n9aXlEBWM0TypYs3cThtxfT8XPF6P+BLoXvXQX/VWaEiPlXy/OtidgKBLa1g1MVH1\nkxu7ySGZFhRqECiuseuBLRJLeEo9rncDWT7CSpu7ktJr5MZFHCzct2W/Q2cjKBW1\n5/7CYPqK9lnfKB/JI53Ksw2nld51zMPMFWsD07RbEyeK4Fi5tQHoPIUyfqNvNoS+\n+xtvigSSX+3Ikgap/JSWWJi+pCOFlgPWsEET9fLWgzYoCZ3RY1TuzzHZATn99D92\ntfZ73hwWBoaLm2jG95vfIeO1f4//3pWdb4b7N4iXdxTLEPV3YRlqytzduGTkosUY\nebXRtGcbAgMBAAECggEACjUWO4gODr7jc/6sDoTw492soePTpSe6lv8B/Z6JfEcq\nyVKvj+XIN4grmvMr5jHZqzl5VEVnknQIEHzeEEkiiX85ZEDmS9Mq2B4ZkwnuUtLN\nIRP2m5nawkkz5V5TOtc9DUKY+9dGlF/VO2xCUM9630FjhdtcWZ6Xzvbw/2X9RkP+\nyG/ZQ4wKDY1jrcVr8i1VQaR377JKqVx2btMGZwuaKCudEZ6v1hJSihLlmA3mCrob\nFVZZWMgIwiVfa4VnYrVad9GkYUh3J2i3Ri8iHcuwPu5Pf9l8SEjpswBLE1GtCY/I\nelZAiMBVa5OuO8O/IwaZmpwL3Q1uV52xtHsUbr2k0QKBgQDxjuX3z70xVdPNOvx7\n462L9WOeLqITht6XBVDdnfP7ifl6IACOftJgM+f06/sk7+66R4s7nk2gae/cx+Qe\nHYBw/0nDZq6KpnXMyO48zwaIH5KmZSp5RR6x5I8hnjm7Q2/G2LKZvx+CXPriAAHR\ntJe6FpSoH7qAjWswDRQ8Rh6QnQKBgQC1gQspDTPmZ/zQeHPwQyKhqmC6svhT5UFD\n5E05nphyb7TjQhRSwtCBbw+H+LTqno6oGshNes9qAbyJbGn+lMWVFFj7ba4E8gvW\nw+fzjUO3ceTWs65nVGpIfk8/KsEnf207bSDiShAEZjGgSBxzaDow+nHRDI4eu+Js\nqQjfRoA9FwKBgBdeP5kNm7veFbNQ9YP2rp9PieePk1ZYQchSV1RZJ3U6D8xktCkU\n071CyDnFanJUU7/pk+qckd3m4bF2FPdk2zwTNkuU72WyXMsG1SVE0djxVPqL5uP8\nb8+90Krr56HaEEIoTH7bIm02GX8riQGEevkhnhf1mdE93RS07zQ1hFdxAoGAHkmC\nSz9gwbnofgEbl6QcS03bBkyHE7jVwzZ9jHfiiHYLgUCtk4HeuTqHJPFjfyMmOvb9\nJbCwm8feZjApH8pDjjTvBEWxHDInt5bJReL0wc/Hl+wz1hpIAgDRyICh6q1g1OHI\n8vnY4mMLNOvTk45452NjSrcFoCtKBUfPqzJgg9ECgYAM+JeJz6ek90fORuvFQQAi\nYD+/gQP8WMuAF3T6qGgCKT/DzGVIgxp5WxTzZr//CV8J1k2GMrh6+FKIhRA2LiiH\nhPeKGvNW3oWs2Y0U24bbErQULO2cSL4FHN0vl+l0nNUdbbwUdxsaVnXHIH1PQpyz\npaXPHUh6F6Q7OSkM+cYZoQ==\n-----END PRIVATE KEY-----\n",
          },
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
            let user = await userModel.findOne({ googleAuth: profile.id, role: 'buyer'  });
            console.log("User: ", user)
            if (!user) {
                const newUser = await userModel.create({
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    googleAuth: profile.id,
                    role: 'buyer'
                });

                console.log("USER CREATED: ", user)

                const payload = {
                    _id: user._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email
                };

                const token = jwt.sign({ _id: user._id }, config.get('JWT_SECRET'));

                return res.send({ token, payload });
            }else{

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
    } else {
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