const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema(
  {
    members: Array,
  },
  {
    timestamps: true,
  }
);

const chatModel = moongoose.model("Chat",chatSchema); 
module.exports = chatModel;
