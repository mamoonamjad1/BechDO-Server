const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
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
    },
    status:{
        type:String,
        enum:["Paid","UnPaid"],
        default:"UnPaid"
    },
    deliveryStatus:{
        type:String,
        enum:["Recieved","InTransit","Delivered"],
        default:"Recieved"
    },
    seller:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    buyer:{
        type:mongoose.Types.ObjectId,
        ref:'users'
    },
    products:{
        type:mongoose.Types.ObjectId,
        ref:'products'
    }
})

const orderModel = mongoose.model('order',orderSchema)
module.exports = orderModel