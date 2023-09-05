const mongoose = require('mongoose')
const user = require('./user')

const notificationSchema = mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:'users',
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref:'products',
    },
    detail:{
        type:String
    },
    createdAt:{
        type:Date
    }
})
const notificationModel = mongoose.model('notifications',notificationSchema)
module.exports = notificationModel