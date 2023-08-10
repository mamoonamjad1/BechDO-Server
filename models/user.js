
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
   firstName:String,
   lastName:String,
   email:{
    type:String,
    lowercase:true
   },
   phoneNumber:String,
   address:String,
   password:String,
   confirmPassword:String,
   image:String,
   role:String,
   products:[{
      type:mongoose.Types.ObjectId,
      ref:'products'
  }]
})
const userModel = mongoose.model('users', userSchema);
module.exports = userModel