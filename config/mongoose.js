const mongoose = require("mongoose");
require('dotenv').config();

const { MONGO_URL } = process.env

exports.connectDB = async () => {
  await mongoose.connect(MONGO_URL ||'');
  console.log("Connect Database Successfully");
}