const mongoose = require('mongoose');

const otpSchema =  mongoose.Schema({

    email: {type: String, required: true},
    otp: {type: String, required: true},
    expireAt: { type: Date,
                default: Date.now,
                index: { expires: 120}
    },
    
}, {collection: 'otp'});

const model = mongoose.model('Otp', otpSchema);
module.exports = model;