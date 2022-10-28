const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const nodemailer = require('nodemailer');
const Chats = require('./models/chats');
const User = require('./models/user');
// const connectedClients = require('./models/connection');


///// I need to replace the directory where images are being stored with using cloudinery instead
///////////// I need to clean up the routes and make the server app more organized by taking the socket to
// a different position and taking the multer to a better position in the routes
// Find out why the uploads folder was made static so it could be accessible
// Replace the static folder with cloudinary

mongoose.connect(process.env.MONGO_URI);

let clients = [];
const con = mongoose.connection;
con.on('open', error => {
    if(!error){
        console.log('DB connection successful');
    }else{
        console.log(`DB connection failed with error: ${error}`);
    }
})



const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// app.use(express.json);
// app.use(express.urlencoded());

app.use('/chats', require('./routes/chats'));
app.use('/auth', require('./routes/auth'));
app.use('/sendImage', require('./utils/multer'));
app.use('/viewUsers', require('./routes/viewOps'));

// Made the uploads folder global so that I could access the contents of the folder from anywhere on through a URL
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT,()=> console.log(`Server running at port ${PORT}`));

const io = require('socket.io')(server);

const ConnectedUser = new Set();
io.on('connection', (socket)=>{
    console.log("Connected succesfully", socket.id);
    
    
    ConnectedUser.add(socket.id);
    io.emit('connected-user', ConnectedUser.size);
    socket.on('disconnect', async()=>{

        console.log("Disconnected",socket.id);
        // if(clients[]){

        // }
        ConnectedUser.delete(socket.id);

        
        // let user = new User.find({id});
        // user.isOnline = false;
        // await user.save();
    });

    socket.on('signin',async (id)=>{

        //This code is buggy because of the socket line

        // let connectedUser = new connectedClients;
        // connectedUser.user_id = id;
        // connectedUser.clientSocket = socket;
        // connectedUser = await connectedUser.save();

        // console.log(`The content in the socket is >>>>>>>>>> ${socket}`);
        clients[id]= socket.id;
        console.log(id);

        // let user = await new User.find({id});
        // user.isOnline = true;
        // await user.save();

    })

    socket.on('message', async(msg)=>{

        let targetId = msg.targetId;
        
        if(clients[targetId]){

            io.to(clients[targetId]).emit("message",msg);

            let chat = new Chats();
            chat.msg = msg.message;
            chat.source_id = msg.sourceId;
            chat.target_id = msg.targetId;
            chat.image_path = msg.imagePath;
            chat.isSent  = true;
            chat.timeStamp = Date.now();

            chat = await chat.save();

        }

        else{

            let chat = new Chats();
            chat.msg = msg.message;
            chat.source_id = msg.sourceId;
            chat.target_id = msg.targetId;
            chat.image_path = msg.imagePath;
            chat.isSent  = false;
            chat.timeStamp = Date.now();

            chat = await chat.save();

        }
        
        console.log(msg);

    });
});