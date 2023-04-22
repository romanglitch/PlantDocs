const mongoose = require('mongoose');

const weedSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    tags: {
        type: String,
        required: false
    },
    created_date: {
        type: String,
        required: true
    },
    harvest_date: {
        type: String,
        required: false
    },
    weeks: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('weeds', weedSchema)