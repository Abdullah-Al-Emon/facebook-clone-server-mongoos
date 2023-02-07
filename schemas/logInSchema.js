const mongoose = require('mongoose');

const logInSchema = mongoose.Schema({
    email: String,
    password: String
});

module.exports = logInSchema;