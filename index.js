const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

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

app.use(express.json);
app.use(express.urlencoded());

app.use('/chats', require('./routes/chats'));
app.use('/auth', require('../routes/auth'));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT,()=> console.log(`Server running at port ${PORT}`));

const io = require('socket.io')(server);

const ConnectedUser = new Set();
io.on('connection', (socket)=>{
    console.log("Connected succesfully", socket.id);

    
    ConnectedUser.add(socket.id);
    io.emit('connected-user', ConnectedUser.size);
    socket.on('disconnect',()=>{

        console.log("Disconnected",socket.id);
        ConnectedUser.delete(socket.id);
    });

    socket.on('signin',(id)=>{

        clients[id]= socket;
        console.log(id);

        // socket.broadcast.emit('message-receive', data)
    })

    socket.on('message',(msg)=>{

        let targetId = msg.targetId;

        // The receiver of the message might not be present online at that time
        // or might not be on the chat page rather. So if the receiver is on the chat page i.e we have his socket id
        // then you can send his message if not, dont send the message
        // we rather will only send the message to the database and when the client opens that page, the init state
        // loads the msg, or the user can also have the socket on down on the page where his contacts are 
        // That page only listens for new messages and the numner of times the messages was sent 
        // Thats what displays on your screen when you open the home page of your chat app
        
        if(clients[targetId]){

            clients[targetId].emit("message",msg);
        }
        
        console.log(msg);

        // socket.broadcast.emit('message-receive', data)
    });
});