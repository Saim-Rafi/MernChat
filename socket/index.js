const { Server } = require("socket.io");

const io = new Server({ cors: "http://localhost:5173" });

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  //listen to a connection
  socket.on("addNewUser", (userId) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({ userId, socketId: socket.id });
  });
  console.log("OnlineUsers",onlineUsers);

  io.emit("getOnlineUsers", onlineUsers); 
});

io.listen(3000);
