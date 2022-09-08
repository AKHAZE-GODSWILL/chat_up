const express = require('express');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');

const router = express.Router();

// endpoint to like a post
router.post('/like_post', async (req, res) => {
    const {token, post_id} = req.body;

    if(!token || !post_id){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        const found = await Post.findOne({_id: post_id, likes: user._id});

        if(found)
            return res.status(400).send({status: 'error', msg: 'You already liked this post'});

        const post = await Post.findOneAndUpdate(
            {_id: post_id},
            {
                "$push": {likes: user._id},
                "$inc": {like_count: 1}
            },
            {new: true}
        ).lean();

        return res.status(200).send({status: 'ok', msg: 'Success', post});

    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});

// endpoint to like a comment on a post

// endpoint to unlike a post
router.post('/unlike_post', async (req, res) => {
    const {token, post_id} = req.body;

    if(!token || !post_id){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        const found = await Post.findOne({_id: post_id, likes: user._id});

        if(!found)
            return res.status(400).send({status: 'error', msg: 'You haven\'t liked this post before'});

        const post = await Post.findOneAndUpdate(
            {_id: post_id},
            {
                "$pull": {likes: user._id},
                "$inc": {like_count: -1}
            },
            {new: true}
        ).lean();

        return res.status(200).send({status: 'ok', msg: 'Success', post});

    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});

// endpoint to unlike a comment on a post

module.exports = router;