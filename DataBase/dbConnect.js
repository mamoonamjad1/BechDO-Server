const mongoose = require('mongoose')

const password = encodeURIComponent("<MamoonAmjad1>");
const connectDb = async () => {
    try {
      mongoose.set('strictQuery',false).connect("mongodb+srv://mamoonamjad17:undertaker123@cluster0.ujqcero.mongodb.net/BechDO?retryWrites=true&w=majority")
      .then(()=>{console.log("Connected to DataBase")})
    } catch (err) {
      console.log(err);
      // Quit server if db connection fails
      process.exit(1);
    }
  };

  module.exports = connectDb