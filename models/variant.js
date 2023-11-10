const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    carMake: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CarMake',
        required: true
    },
    // other fields for the variant schema
});

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
