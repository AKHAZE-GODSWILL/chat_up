const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config()

const transporter = nodemailer.createTransport(transporter, {
    service: "Gmail",
    auth:{
        user: `${process.env.EMAIL_NAME}`,
        pass: `${process.env.EMAIL_PASSWORD}`
    }
});

const options = {
    from: `${process.env.EMAIL_NAME}`,
    to: "onosetaleakhaze@gmail.com",
    subject: "sending email with node",
    text: "Hey there. Sending emails worked. I have to go to the styling now"
}

transporter.sendMail(options,  function (err,info){

        if(err){
                console.log(err);
                return;
        }

        console.log("sent" + info.response);
});