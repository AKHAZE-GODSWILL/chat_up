const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { Console } = require('console');
dotenv.config();
const app = express();

mongoose.connect(process.env.MONGO_URI);

const con = mongoose.connection;
con.on('open', error => {
    if(!error){
        console.log('DB connection successful');
    }else{
        console.log(`DB connection failed with error: ${error}`);
    }
})





app.use(express.json);
app.use(express.urlencoded());

app.use('/chats', require('./routes/chats'));
app.use('/auth', require('./routes/auth'));

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

    socket.on('message',(data)=>{

        console.log(data);
        socket.broadcast.emit('message-receive', data)
    })
});