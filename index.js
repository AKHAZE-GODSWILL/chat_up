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

    socket.on('disconnect', ()=>{
        let index = clients.findIndex(
            object => {
                return object.socketId === socket.id;
            }
        );
        console.log(index);
        clients.splice(index,1,0);
        io.emit('onlineUsers', clients);
        console.log("Disconnected",socket.id);
        console.log(clients);
        ConnectedUser.delete(socket.id);

    });

    socket.on('signin', (id)=>{

        // console.log(`The content in the socket is >>>>>>>>>> ${socket}`);
        let socketId = socket.id;
        clients.push({id,socketId});
        // console.log(id);
        console.log(clients);
        console.log(`The connected clients ${clients}`);
        io.emit('onlineUsers', clients);
        // let user = await new User.find({id});
        // user.isOnline = true;
        // await user.save();

    })

    socket.on('message', async(msg)=>{

        // >>>>>>>>>>>>>i have to fix the sending image feature which no longer works
        let targetId = msg.targetId;
        let client = clients.find(({id}) => id == targetId );
        
        if(client !== undefined){

            io.to(client.socketId).emit("message",msg);

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