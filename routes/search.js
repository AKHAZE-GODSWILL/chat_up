const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Endpoint to search all users
router.post('/users', async (req, res) => {
    const { token, search, pageCount } = req.body;

    if(!token || !search || !pageCount) {
        return res.status(400).send({ status: 'error', msg: 'All fields must be entered' });
    }

    try {
        let admin = jwt.verify(token, process.env.JWT_SECRET);

        admin = await Admin.findOne({ _id: admin._id }).select([ '-password' ]).lean();

        if(admin.status != true) {
            return res.status(400).send({ status: 'error', msg: 'Account has been blocked, please contact master admin' });
        }

        let resultPerPage = 10;
        let page = (pageCount > 1) ? pageCount : 1;
        page -= 1;

        let users = await User.find({
            is_deleted: false,
            account_status: 'active',
            $or: [
                { fullname: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
                { phone_no: new RegExp(search, 'i') },
            ]
        }) 
        .select([ 'fullname', 'email', 'img' ])
        .limit(resultPerPage)
        .skip(page * resultPerPage)
        .lean();
        
        if(users.length == 0) {
            return res.status(200).send({ status: 'ok', msg: 'No user found, try another search' });
        }

        return res.status(200).send({ status: 'ok', msg: 'Success', users });
    }

    catch(error) {
        console.log(error);
        return res.status(400).send({ status: 'error', msg: 'Some error occurred', error });
    }
});

