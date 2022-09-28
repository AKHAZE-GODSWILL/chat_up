const mongoose =  require('mongoose');

const connectedClients = mongoose.Schema(
    {
        clients: [String],
        user_id: String
    },{collection: "connectedClients"}
);

const model = mongoose.model('connectedClients', connectedClients);

module.exports = model;