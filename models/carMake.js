const mongoose = require('mongoose');

const carMakeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('carMake', carMakeSchema);
