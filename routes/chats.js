const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const socketio = require('socket.io');
const User = require('../models/chats');
const router = express.Router();
const upload = require('../utils/multer');

router.post('/chats', async(req,res)=>{

            


});

module.exports = router;