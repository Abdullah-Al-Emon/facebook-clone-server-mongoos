const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const postSchema = require('../schemas/postSchema.js');
const post = new mongoose.model('post', postSchema);

router.get('/post', async (req, res) =>
{
    await post.find({ options: "Public" })
        .then((posts) =>
        {
            res.json({ posts })
        }).catch(err =>
        {
            console.log(err)
        })
});

router.get('/myPost', async (req, res) =>
{
    await post.find({ user_id: req.query.user_id })
        .then((posts) =>
        {
            res.json({ posts })
        }).catch(err =>
        {
            console.log(err)
        })
});

router.post('/post', async (req, res) =>
{
    const newPost = new post(req.body);
    await newPost.save((err) =>
    {
        if (err) {
            res.status(500).json({
                error: 'There was a sever side error!'
            })
        }
        else {
            res.status(200).json({
                message: "Post Was inserted Successfully"
            })
        }
    });
})

router.put('/postEdit/:id', (req, res) => {
    post.findByIdAndUpdate(req.params.id, {
        $set : {
            desc: req.body.desc,
            post_img: req.body.post_img,
            options: req.body.options
        }
    }, {
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else{
            res.json(result)
        }
    })
})

router.put('/options/:id', (req, res) => {
    post.findByIdAndUpdate(req.params.id, {
        $set : {
            options: req.body.options
        }
    }, {
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else{
            res.json(result)
        }
    })
})

router.put('/cross', (req, res) => {
    post.findByIdAndUpdate(req.body.postId, {
        $set: {
            visibility: req.body.visibility,
        },
        $push: {inVisibleUserId: req.body.userId}
    }, {
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else{
            res.json(result)
        }
    })
})

router.put('/undo', (req, res) => {
    post.findByIdAndUpdate(req.body.postId, {
        $set: {
            visibility: req.body.visibility,
        },
        $pull: {inVisibleUserId: req.body.userId}
    }, {
        new: true
    }).exec((err, result) => {
        if(err){
            return res.status(422).json({error: err})
        } else{
            res.json(result)
        }
    })
})

router.put('/like', (req, res) =>
{
    post.findByIdAndUpdate(req.body.postId, {
        $push: { like: req.body.userId }
    }, {
        new: true
    }).exec((err, result) =>
    {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})

router.put('/unlike', (req, res) =>
{
    post.findByIdAndUpdate(req.body.postId, {
        $pull: { like: req.body.userId }
    }, {
        new: true
    }).exec((err, result) =>
    {
        if (err) {
            return res.status(422).json({ error: err })
        } else {
            res.json(result)
        }
    })
})

router.put('/comment',(req,res)=>{
    const comment = {
        text:req.body.text,
        postId:req.body.postId,
        name: req.body.name,
        profile_img: req.body.profile_img
    }
    post.findByIdAndUpdate(req.body.postId,{
        $push:{comment:comment}
    },{
        new:true
    })
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            res.json(result)
        }
    })
})

module.exports = router;