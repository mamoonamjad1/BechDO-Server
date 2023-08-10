const mongoose = require('mongoose')

const connectDb = async () => {
    try {
      mongoose.set('strictQuery',false).connect("mongodb://127.0.0.1/BechDO")
      .then(()=>{console.log("Connected to DataBase")})
    } catch (err) {
      console.log(err);
      // Quit server if db connection fails
      process.exit(1);
    }
  };

  module.exports = connectDb