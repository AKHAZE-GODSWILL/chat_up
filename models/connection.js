const mongoose =  require('mongoose');

const connectedClients = mongoose.Schema(
    {
        clientSocket: {type: Object},
        user_id: String
    },{collection: "connectedClients"}
);

const model = mongoose.model('connectedClients', connectedClients);

module.exports = model;