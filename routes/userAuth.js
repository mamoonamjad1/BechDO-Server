const notificationModel = require('../models/notification');
const userModel = require('../models/user');
const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config= require('config')

router.post('/register', async(req,res)=>{
    const {firstName, lastName , email, password, confirmPassword  } = req.body;
    if(password!==confirmPassword)
    return res.status(400).send("Passwords Do Not Match")

    const userAlreadyRegistered= await userModel.findOne({email , role:'buyer'})
    if(userAlreadyRegistered)
    return res.status(400).send("User Already Registered")

    const hashedPassword = await bcrypt.hash(password,12)
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword,12)
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password:hashedPassword,
        confirmPassword:hashedConfirmPassword,
        role:'buyer'
    })
    res.send("User Successfully Registered")
})

router.post('/login', async(req,res)=>{
    const {email,password} = req.body;

    const user = await userModel.findOne({email})
    if(!user)
    return res.status(400).send("User Is Not Registered")
    if(user.role == 'seller'){
        res.status(400).send("Not Authorised")
    }
    const hasedPassword = await bcrypt.compare(password,user.password)
    if(!hasedPassword)
    {
        return res.status(400).send("Passwords Do Not Match")
    }

    const payload={
        _id:user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }
    const token = jwt.sign({_id:user._id,},config.get('JWT_SECRET'))
    
    const notification = await notificationModel.find({user:user._id})
    res.send({token,payload,notification})

})

module.exports = router