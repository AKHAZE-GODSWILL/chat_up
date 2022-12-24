const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const nodemailer = require('nodemailer');
const Chats = require('./models/chats');
const User = require('./models/user');
/// const connectedClients = require('./models/connection');

/// Thid piece of code manages your connection to the mongo database
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


/// Body parser is a middle ware to hold the body of any post request that you make
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/// app.use(express.json);
/// app.use(express.urlencoded());

/// These are the various routes to my different endpoints
app.use('/chats', require('./routes/chats'));
app.use('/auth', require('./routes/auth'));
app.use('/viewUsers', require('./routes/viewOps'));
app.use('/posts', require('./routes/posts'));


/// You declare the port number where your server app is to run on
/// if your app is deployed to the server, you will not have any control over the available ports
/// so you need to use the process.env.PORT
const PORT = process.env.PORT || 8000;

/// you then need to tell your server app to listen to the to the port where your app is running using app.listen()
const server = app.listen(PORT,()=> console.log(`Server running at port ${PORT}`));


/// This is the syntax for anything that has to do with sockets
/// When you are requiring your socket, you have require the sockets
///  and also place the app.listen besides the require socket
const io = require('socket.io')(server);

const ConnectedUser = new Set();

/// Now this is how you initialize your socket
/// And every code that has to do with sockets my be within this block

////////////// There are two most important commands.
//// The socket.emit('event Name', data you want to emit goes in here )
///Socket.on('event Name', (){the function that you want to write to handle the data coming in, goes in here})

io.on('connection', (socket)=>{
    console.log("Connected succesfully", socket.id);
    
    
    ConnectedUser.add(socket.id);
    io.emit('connected-user', ConnectedUser.size);


    /// This particular event handles any logic that you want to run when the any user disconnects from the socket
    /// or goes offline. Any way you want to see it
    socket.on('disconnect', ()=>{
        let client = clients.find(({socketId}) => socketId == socket.id );
        let index = clients.findIndex(
            object => {
                return object.socketId === socket.id;
            }
        );
        console.log(index);
        clients.splice(index,1);
        io.emit('onlineUsers', clients);
        io.emit('offlineUser', client);
        console.log("Disconnected",socket.id);
        console.log(clients);
        ConnectedUser.delete(socket.id);

    });

    /// This particular event handles all the sign in that happens in the mobile app
    /// How this stuff works, anything you emit in the mobile app with a specific event name
    /// lands inside the event block of same name in the back end.

    /// Anything you emit on the back end with the same event name, lands in the event function in the mobile app
    /// of same event name

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

    });

    socket.on('stories', (data)=>{

        console.log(data);
        io.emit('stories',data);

    });



    //////////>>>>> For this message part, you have to first declare an array that will hold any connected users
    /// This array will hold an object or map as you know it in dart
    /// The map will contain the user id and the user socket id.
    /// The logic used to save the map in the sign in block

    socket.on('message', async(msg)=>{

        // >>>>>>>>>>>>>i have to fix the sending image feature which no longer works
        let targetId = msg.targetId;
        let client = clients.find(({id}) => id == targetId );
        

        //// You have to put this if statement to avoid the socket to try send message to someone that is not
        ///Currently connected to the socket
        /// If you send to someone that is not connected, the server will crash
        if(client !== undefined){

            ///>>>>>>> This is how you send a message to just one person without other people getting the message 
            io.to(client.socketId).emit("message",msg);

            /// Saving my message as a new document in the chats collection
            let chat = new Chats();
            chat.msg = msg.message;
            chat.source_id = msg.sourceId;
            chat.target_id = msg.targetId;
            chat.image_path = msg.imagePath;
            chat.isSent  = true;
            chat.timeStamp = Date.now();

            chat = await chat.save();

        }

        /// This else statement handles everything for unconnected users
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

    socket.on('wave', async(wave)=>{

        // >>>>>>>>>>>>>i have to fix the sending image feature which no longer works
        let targetId = wave.targetId;
        let client = clients.find(({id}) => id == targetId );
        
        if(client !== undefined){

            io.to(client.socketId).emit("wave",wave);

        }

        else{}
        
        console.log(wave);

    });
});