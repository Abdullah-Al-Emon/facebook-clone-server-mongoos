const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    first_name: String,
    surname: String,
    email: String,
    password: String,
    birth_date: String,
    img: String,
    cover_Img: String,
    student: String,
    lives_In: String,
    from: String
});

module.exports = signSchema;