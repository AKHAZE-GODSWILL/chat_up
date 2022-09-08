const express = require('express');
const Post = require('../models/post');
const Comment = require('../models/comment')
const jwt = require('jsonwebtoken');

// change to returning a list of 10 most recent comments
// instead of just the most recent comment
const router = express.Router();

// endpoint to make a comment on a post
router.post('/comment', async (req, res) => {
    const {token, comment, post_id, owner_name, owner_img} = req.body;

    if(!token || !post_id || !comment || !owner_name){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    const timestamp = Date.now();

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        let mComment = new Comment;
        mComment.comment = comment;
        mComment.post_id = post_id;
        mComment.owner_id = user._id;
        mComment.owner_name = owner_name;
        mComment.owner_img = owner_img || '';
        mComment.timestamp = timestamp;
        
        mComment = await mComment.save();

        const post = await Post.findOneAndUpdate(
            {_id: post_id},
            {"$inc": {comment_count: 1}},
            {new: true}
        );
        
        return res.status(200).send({status: 'ok', msg: 'Success', post, comment: mComment});

    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});

// endpoint to get comments of a post
router.post('/get_comments', async (req, res) => {
    const {token, post_id, pagec} = req.body;

    if(!token || !post_id || !pagec){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        const resultsPerPage = 2;
        let page = pagec >= 1 ? pagec : 1;
        page = page -1;

        const comments = await Comment.find({post_id})
        .sort({timestamp: 'desc'})
        .limit(resultsPerPage)
        .skip(resultsPerPage * page)
        .lean();

        return res.status(200).send({status: 'ok', msg: 'Success', comments});
    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});

// endpoint to delete a comment

// endpoint to edit a comment

module.exports = router;