const express = require('express');
const User = require('../models/user');
const Otp = require('../models/otp');
const router = express.Router();
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');




// end point to create otp

router.post('/createOtp', async(req, res)=>{

        const {email} = req.body

        if(!email){
                return res.status(400).send({status: 'error', msg: 'All fields should be filled'});
        }

        try{
            const user = await User.findOne({email});
            if(user){
                     return  res.status(400).send({status: 'error', msg: 'User with this email already exists'});
            }

            // deletes any otp found having that email in any of its fields
            // before resending a new one
            const usersOtp = await Otp.findOne({email});
            if(usersOtp){

                const OTPDelete = await Otp.deleteMany({
                    email: email
                });
            }
            
            const OTP = otpGenerator.generate(6, {
                                                  digits: true,
                                                  lowerCaseAlphabets: false,
                                                  upperCaseAlphabets: false,
                                                  specialChars: false});
            console.log(OTP);

            const bOTP = await bcrypt.hash(OTP, 10);

            let otp = new Otp;
            otp.email = email;
            otp.otp = bOTP;
            otp = await otp.save();

            const transport = nodemailer.createTransport({
                service: 'Gmail',
                auth:{
                    user: "onosetaleakhaze@gmail.com",
                    pass: "onosetaleakhaze2017"
                }
            });
            
            transport.sendMail({
                from: "onosetaleakhaze@gmail.com",
                to: "akhazeaiwanose@gmail.com",
                subject: 'Please confirm your account',
                html: `<h1>Email Confirmation</h1>
                <h2>Hello User</h2>
                <p>Thank you for signing up with App Service. Please confirm your email </p>
                <p>Your otp is ${otp}</p>
                <p>Cheers</p>
                <p>Your App Service team</p>
                </div>`
            }).catch(err => console.log(err));

            return res.status(200).send({status: 'ok', msg: 'Otp created successfully', otp});

            

        }catch(e){
            console.log(e);
            return res.status(400).send({status: 'error', msg: 'Some error occured', e});
        }


});


//end point to verify Otp
router.post('/verifyOtp', async(req, res)=>{

           const {email,otp} = req.body
            
           if(!email || !otp){
                return res.status(400).send({status: 'error', msg: 'All fields should be filled'});
           }

           try{

            const specificOtp = await Otp.findOne({email});

            
            if( specificOtp && await bcrypt.compare(otp,specificOtp.otp)){

                const OTPDelete = await Otp.deleteMany({
                    email: email
                });
                return res.status(200).send({status: 'ok', msg: 'Otp verified successfully'});
            }

            return res.status(400).send({status: 'error', msg: 'This otp is not correct or no longer valid, request for a new one'});


           }catch(e){
            console.log(e);
            return res.status(400).send({status: 'error', msg: 'Some error occured', e});
           }



});

// signup endpoint
router.post('/signup', async (req, res) => {
    const {fullname,email, password} = req.body;

    console.log(req.body);
    // checks
    if(!email || !password){
        return res.status(400).send({status: 'error', msg: 'All fields should be filled'});
    }

    try{


        const bpassword = await bcrypt.hash(password, 10);
        const timestamp = Date.now();

        let user = new User;


        user.email = email;
        user.password = bpassword;
        user.username = `${email}_${timestamp}`;
        user.fullname = fullname;
        user = await user.save();

        const token = jwt.sign({
            _id: user._id,
            email: user.email
        }, process.env.JWT_SECRET);

        user['token'] = token;
        
        // TODO: Debug later
        // console.log(user, 'here 1');
        // user['token'] = token;

        // console.log(user, 'here 2');

        return res.status(200).send({status: 'ok', msg: 'User created', user,token});

    }catch(e){
        if(e.code === 11000){
            return res.status(400).send({status:"error", msg:"Another account already uses this email" });
        }
        console.log(e);
        return res.status(400).send({status: 'error', msg: 'Some error occured'});
    }
});


// login endpoint
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    // checks
    if(!email || !password){
        return res.status(400).send({status: 'error', msg: 'All fields should be filled'});
    }

    try{

        const user = await User.findOne({email}).lean();
        if(!user){
            return res.status(404).send({status: 'error', msg: `No user with email: ${email} found`});
        }



        if(await bcrypt.compare(password,user.password)){
            delete user.password
            const token = jwt.sign({
                _id: user._id,
                email: user.email
            }, process.env.JWT_SECRET);
    
            user['token'] = token;
            return res.status(200).send({status: 'ok', msg: 'Login successful', user,token});
        }

        return res.status(400).send({status: 'ok', msg: 'Login details is incorrect'})

    }catch(e){
        console.log(e);
        return res.status(400).send({status: 'error', msg: 'Some error occured', e});
    }
});


// endpoint to delete a user
router.post('/delete_user', async (req, res) => {

    const {user_id} = req.body;

    if(!user_id){
        return res.status(400).send({status: 'error', msg: 'All fields should be filled'});
    }
    try{
        await User.deleteOne({_id: user_id});

        return res.status(200).send({status: 'ok', msg: 'delete successful'})

    }catch(e){
        console.log(e);
        return res.status(400).send({status: 'error', msg: 'Some error occured', e});
    }


});

module.exports = router;