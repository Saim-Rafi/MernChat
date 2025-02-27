const moongoose = require("mongoose");

const messageSchema = new moongoose.Schema({
    chatId: String,
    senderId: String,
    text: String
},{
    timestamps: true
}
)

const messageModel = moongoose.model("Message",messageSchema);

module.exports = messageModel;