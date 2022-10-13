const connectedClients = require('./models/connection');

module.exports = {

   init:  (server)=> {

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


    socket.on('signin', async (id)=>{

        let connectedUser = new connectedClients;
        connectedUser.user_id = id;
        connectedUser.clientSocket = socket;
        connectedUser = await connectedUser.save();

        console.log(`The content in the socket is >>>>>>>>>> ${socket}`);
        console.log(id);

    })

    socket.on('message', async (msg)=>{

        let targetId = msg.targetId;

        

        // The receiver of the message might not be present online at that time
        // or might not be on the chat page rather. So if the receiver is on the chat page i.e we have his socket id
        // then you can send his message if not, dont send the message
        // we rather will only send the message to the database and when the client opens that page, the init state
        // loads the msg, or the user can also have the socket on down on the page where his contacts are 
        // That page only listens for new messages and the numner of times the messages was sent 
        // Thats what displays on your screen when you open the home page of your chat app
        const targetedUser = connectedClients.findOne({ user_id :targetId}).lean();

        if(targetedUser){
            targetedUser.clientSocket.emit("message",msg);
        }

        // if(clients[targetId]){

        //     clients[targetId].emit("message",msg);
        // }
        
        console.log(msg);

        // socket.broadcast.emit('message-receive', data)
    });
});
    }
}