const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const userRoute = require("./Routes/userRoute");
const chatRoute = require("./Routes/chatRoute");
//const messageRoute = require("./server/Routes/messageRoute")
const messageRoute = require("./Routes/messageRoute");

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.get("/", (req, res) => {
  res.send("hello welcome to The Chattr Box");
});

const port = process.env.PORT || 5001;
const uri = process.env.ATLAS_URI;

const expressServer = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongoose is connected"))
  .catch((err) => console.log(err));

const io = new Server(expressServer,{
  cors: {
    origin: process.env.CLIENT_URL,
  },
});


let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  //listen to a connection
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });
  });
  console.log("OnlineUsers", onlineUsers);

  io.emit("getOnlineUsers", onlineUsers);

  //add message
  socket.on("sendMessage", (message) => {
    const user = onlineUsers.find(
      (user) => user.userId === message.recipientId
    );
    if (user) {
      io.to(user.socketId).emit("getMessage", message);
      io.to(user.socketId).emit("getNotification", {
        senderId:message.senderId,
        isRead:false,
        date: new Date(),
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

 

