require('dotenv').config();
const mongoose = require('mongoose');

module.exports = function() {
    mongoose.connect(process.env.MONGODB_URI);
}

