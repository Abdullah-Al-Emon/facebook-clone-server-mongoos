const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const signSchema = new mongoose.Schema({
    first_name: String,
    surname: String,
    email: String,
    password: String,
    requests: [{type:Object}],
    following: [{type:Object}],
    followers: [{type:Object}],
    friends: [{
        id: ObjectId,
        friend: String,
        userId: String,
        first_name: String,
        surname:String,
        img:String,
        email: String
    }],
    birth_date: String,
    img: String,
    cover_Img: String,
    student: String,
    lives_In: String,
    from: String,
});

module.exports = signSchema;