const express = require('express');
const Post = require('../models/post');
const Follow = require('../models/follow');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const upload = require('../utils/multer');
const cloudinary = require('../utils/cloudinary');

const router = express.Router();

// endpoint to send a picture to a friend
router.post('/uploadImage', upload.single('image'), async (req, res) => {
    const {token} = req.body;
    if(!token){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        const timestamp = Date.now();

        let user = jwt.verify(token, process.env.JWT_SECRET);
        if(!user){
            return res.status(400).send({msg: "No user found. Wrong token passed in" });
        }

        let img_url;
        let img_id;
        
        const result = await cloudinary.uploader.upload(req.file.path, {folder: 'chat_up'});
        img_url = result.secure_url;
        img_id = result.public_id;
        
        return res.status(200).send({status: 'ok', msg: 'Success', img_url});


    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }

});

// // endpoint to post stories
// router.post('/postStories', upload.single('image'), async (req, res) => {
//     const {token} = req.body;
//     if(!token){
//         return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
//     }

//     try{
//         const timestamp = Date.now();

//         let user = jwt.verify(token, process.env.JWT_SECRET);
//         if(!user){
//             return res.status(400).send({msg: "No user found. Wrong token passed in" });
//         }

//         let img_url;
//         let img_id;
        
//         const result = await cloudinary.uploader.upload(req.file.path, {folder: 'chat_up'});
//         img_url = result.secure_url;
//         img_id = result.public_id;

        
//         return res.status(200).send({status: 'ok', msg: 'Success', img_url});


//     }catch(e){
//         console.log(e);
//         return res.status({status: 'error', msg: 'An error occured'});
//     }

// });

// endpoint to change profile picture
router.post('/updateProfilePic', upload.single('image'), async (req, res) => {
    const {token} = req.body;
    if(!token){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        const timestamp = Date.now();

        let user = jwt.verify(token, process.env.JWT_SECRET);
        if(!user){
            return res.status(400).send({msg: "No user found. Wrong token passed in" });
        }

        let img_url;
        let img_id;
        
            const result = await cloudinary.uploader.upload(req.file.path, {folder: 'chat_up'});
            img_url = result.secure_url;
            img_id = result.public_id;

        user = await User.findOneAndUpdate(
            {_id: user._id},
        
            {img: img_url,
            img_id},
            
            {new: true}
        );
        
            return res.status(200).send({status: 'ok', msg: 'Success', user});


    }catch(e){
        console.log(e);
        return res.status({status: 'error', msg: 'An error occured'});
    }

});


// enpoint to make a blog post
router.post('/post', upload.array('post_files'), async (req, res) => {
    const {token, title, body, owner_name, owner_img} = req.body;

    if(!token || !title || !body || !owner_name || !owner_img){
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'});
    }

    try{
        const timestamp = Date.now();

        let user = jwt.verify(token, process.env.JWT_SECRET);

        let post = new Post;

        let img_urls = [];
        let img_ids = [];
        if(req.files.length != 0){
            for(let i = 0; i < req.files.length; i++){
                let result = await cloudinary.uploader.upload(req.files[i].path, {folder: 'mongoose_ops'});
                console.log(result);
                img_urls.push(result.secure_url);
                img_ids.push(result.public_id);
            }
        }

        post.title = title;
        post.body = body;
        post.owner_name = owner_name;
        post.owner_img = owner_img;
        post.timestamp = timestamp;
        post.owner_id = user._id;
        post.likes = [];
        post.imgs = img_urls;
        post.img_ids = img_ids;

        post = await post.save();

        // increment post count
        user = await User.findOneAndUpdate(
            {_id: user._id},
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