const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    name:String,
    image:String,
    description:String,
    products:[{
        type:mongoose.Types.ObjectId,
        ref:'products'
    }],
    parts:[{
        type:mongoose.Types.ObjectId,
        ref:'parts'
    }],
})

const categoryModel = mongoose.model('categories', categorySchema)
module.exports = categoryModel
