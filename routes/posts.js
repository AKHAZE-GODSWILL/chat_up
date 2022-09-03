const express = require('express');
const Post = require('../models/post');
const Follow = require('../models/follow');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const router = express.Router();

// enpoint to make a blog post
router.post('/post', async (req, res) => {
    const {owner_id, title, body, owner_name, owner_img} = req.body;

    if(!owner_id || !title || !body || !owner_name || !owner_img){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        const timestamp = Date.now();
        let post = new Post;

        post.title = title;
        post.body = body;
        post.owner_name = owner_name;
        post.owner_img = owner_img;
        post.timestamp = timestamp;
        post.owner_id = owner_id;
        post.likes = [];

        post = await post.save();

        // increment post count
        const user = await User.findOneAndUpdate(
            {_id: owner_id},
            {
                "$inc": {"stats.post_count": 1}
            },
            {new: true}
        );

        console.log(user);

        return res.status(200).send({status: 'ok', msg: 'Success', post});
    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }

});

// endpoint to edit a blog post


// endpoint fetch all posts for a specific user


// endpoint fetch posts based on persons a user is following
router.post('/all_posts', async (req, res) => {
    const {token, pagec} = req.body;

    if(!token || !pagec){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        const resultsPerPage = 2;
        let page = pagec >= 1 ? pagec : 1;
        page = page -1;

        // get all ids of those the currentUser is following
        const followings = await Follow.find({follower_id: user._id}).lean();
        const following_ids = followings.map(following => following.following_id);

        const posts = await Post.find({
            owner_id: {"$in": following_ids}
        }).sort({timestamp: 'desc'})
        .limit(resultsPerPage)
        .skip(resultsPerPage * page)
        .lean();

        return res.status(200).send({status: 'ok', msg: 'Success', posts});
    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});


// endpoint to get a specific post


// endpoint to delete post


// endpoint to archive post

module.exports = router;