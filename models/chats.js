const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    msg: String,
    source_id: String,
    target_id: String,
    image_path:{type: String},
    isSent: {type: Boolean},
    timeStamp: String
    
}, {collection: 'chats'});

const model = mongoose.model('chats', chatSchema);
module.exports = model;