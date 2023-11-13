
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
  }],
  notification:[{
   type:mongoose.Types.ObjectId,
   ref:'notification'
  }],
  socketId: String,
  accountId:String,
  googleAuth:String,
  verified: {
   type: Boolean,
   default: false,
},
verificationToken: {
   type: String,
},
verificationTokenExpires: {
   type: Date,
},
})
const userModel = mongoose.model('users', userSchema);
module.exports = userModel