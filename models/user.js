const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    fullname: String,
    username: {type: String, unique: true},
    img: String,
    img_id: String,
    phone: Number,
    isOnline:{type: Boolean, default: false},
    account_status:{type:String, default: "active"},
    stats: {
        post_count: {type: Number, default: 0},
        followers_count: {type: Number, default: 0},
        following_count: {type: Number, default: 0}
    }
}, {collection: 'users'});

const model = mongoose.model('User', userSchema);
module.exports = model;