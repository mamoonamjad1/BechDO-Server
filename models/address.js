const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    firstName:String,
    lastName:String,
    phone:String,
    email:{
        type:String,
        lowercase:true
    },
    address:String,
    city:String,
    postalCode:Number,
    payment:{
        type:String,
    }
})

const addressModel = mongoose.model('address',addressSchema)
module.exports = addressModel