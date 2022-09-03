const express = require('express');
const User = require('../models/user');
const Follow = require('../models/follow');
const jwt = require('jsonwebtoken');

const router = express.Router();

// endpoint to follow a user
router.post('/follow', async (req, res) => {
    const {token, following_id} = req.body;

    if(!token || !following_id){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        const follow = new Follow;
        follow.follower_id = user._id;
        follow.following_id = following_id;

        await follow.save();

        // increase counts
        user = await User.findOneAndUpdate(
            {_id: user._id},
            {"$inc": {"stats.following_count": 1}},
            {new: true}
        ).select(['-email', '-password', '-fullname',
        '-username', '-img', '-img_id']).lean();

        await User.updateOne(
            {_id: following_id},
            {"$inc": {"stats.followers_count": 1}}
        );

        return res.status(200).send({status: 'ok', msg: 'Follow Success', user});
    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});


// endpoint to unfollow a user
router.post('/unfollow', async (req, res) => {
    const {token, following_id} = req.body;

    if(!token || !following_id){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        await Follow.deleteOne({follower_id: user._id, following_id});

        // increase counts
        user = await User.findOneAndUpdate(
            {_id: user._id},
            {"$inc": {"stats.following_count": -1}},
            {new: true}
        ).select(['-email', '-password', '-fullname',
        '-username', '-img', '-img_id']).lean();

        await User.updateOne(
            {_id: following_id},
            {"$inc": {"stats.followers_count": -1}}
        );

        return res.status(200).send({status: 'ok', msg: 'Unfollow Success', user});
    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }
});


module.exports = router;