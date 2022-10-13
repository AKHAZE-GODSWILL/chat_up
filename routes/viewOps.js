const express = require('express');
const Users = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

// Endpoint to view all users
router.post('/allUsers', async(req,res)=>{

    const {token} = req.body;

    try{

        let user = jwt.verify(token, process.env.JWT_SECRET );
        user = await Users.findOne({_id: user._id}).lean();

        if(!user){
            return res.status(400).send({status: "error", msg:"wrong token"});
        }

        let allUsers = await Users.find({account_status: 'active'})
        .select(['_id', 'fullname', 'img','email'])
        .lean();

        allUsers = allUsers.filter(
            function(obj){
              return obj.email !== user.email;
            }
        );

        return res.status(200).send({status:"success", msg:"view all users succesful", allUsers})
    }
    catch(error){
       console.log(error);
       return res.status(400).send({status:"400", msg:"Some error occured"});  
    }
});

module.exports = router