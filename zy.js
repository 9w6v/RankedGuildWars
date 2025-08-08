require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/database/models/userSchema.js')

mongoose.connect(process.env.MONGODB_URI);

run();
async function run() {
    const user = await User.findOne({ ign: "fumxta" });
    console.log(user);
}