const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
name:String,
description:String,
quantity:Number,
category:{
    type:mongoose.Types.ObjectId,
    ref:'categories',
},
status:{
    type:String,
    enum:["Active","InActive","Finished"],
    default:"InActive"
},
images:[
    {type:String},
],
duration:{
    type:Number,
    default:300,
},
timer: {
    type: Number,
    default: 300,
  },
basePrice:{
    type:mongoose.Types.Decimal128
},
currentPrice:{
    type:mongoose.Types.Decimal128
},
owner:{
    type:mongoose.Types.ObjectId,
    ref:'users'
},
auctionStarted: {
    type: Boolean,
    default: false,
  },
  auctionEnded: {
    type: Boolean,
    default: false,
  },
  auctionStartTime:{
    type:Date
  },
  auctionEndTime:{
    type:Date
  },
  bidder:{
    type:mongoose.Types.ObjectId,
    ref:'users'
},
},{timestamps:true})

const productModel = mongoose.model('products' , productSchema)
module.exports = productModel