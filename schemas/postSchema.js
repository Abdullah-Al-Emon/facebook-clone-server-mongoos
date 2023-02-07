const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    options: String,
    profile_pic: String,
    name: Object,
    time: String,
    desc: String,
    post_img: String,
    user_id: String,
    like: [{type:Object,ref:"User"}],
    comment: [{
        profile_img: String,
        name: Object,
        text:String,
        postedBy:{type:Object,ref:"User"}
    }],
    share: String,
});

module.exports = postSchema;