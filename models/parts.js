const mongoose = require('mongoose');
const { Schema } = mongoose;

const partSchema = new Schema({
    category:{
        type:mongoose.Types.ObjectId,
        ref:'categories',
    },
    name:{
        type:String,
        required:true,
    },
});

const Part = mongoose.model('Part', partSchema);

module.exports = Part;