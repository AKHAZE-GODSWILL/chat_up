const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment: String,
    post_id: String,
    owner_id: String,
    owner_name: String,
    owner_img: String,
    timestamp: Number,
    like_count: {type: Number, default: 0},
    reply_count: {type: Number, default: 0},
}, {collection: 'comments'});

const model = mongoose.model('Comment', commentSchema);
module.exports = model;