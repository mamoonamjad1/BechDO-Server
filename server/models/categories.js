const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name:String,
    image:String,
    description:String,
    products:[{
        type:mongoose.Types.ObjectId,
        ref:'products'
    }]
})

const categoryModel = mongoose.model('categories', categorySchema)
module.exports = categoryModel
