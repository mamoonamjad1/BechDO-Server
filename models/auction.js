const mongoose = require('mongoose')

const auctionSchema = mongoose.Schema({
product:{
    type:mongoose.Types.ObjectId,
    ref:'products'
},
bidders:{
    type:mongoose.Types.ObjectId,
    ref:'users'
},
bidAmount:{
    type:mongoose.Types.Decimal128
}

},{timestamps:true})

const productModel = mongoose.model('auctions' , auctionSchema)
module.exports = productModel