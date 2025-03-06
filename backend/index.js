const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
const sequelize = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const  ChatUser  = require("./models/chatuser");
const  User  = require("./models/user");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" },
});

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);


async function getUsersInChat(chatId) {
  const chatUsers = await ChatUser.findAll({
    where: { chatId },
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });

  return chatUsers.map(chatUser => chatUser.User);
}



// Real-time chat with Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setup" , (userId)=>{
       console.log("User setup : " , userId);
       socket.join(userId);
  }) ;

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("sendMessage", async(data) => {
    console.log("Message received to server :", data);

    //find the all user of that particular chat...
    const users = await getUsersInChat(data.chatId);
    console.log("Users in chat", users);

    //send the message to all the user of that chat...
    users.forEach((user) =>
      {
        console.log("userinfo :  " , user.dataValues);
        socket.to(user.dataValues.id).emit("receiveMessage", data)
      }
  );
    
    //socket.to(data.chatId).emit("receiveMessage", data)....
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

app.get('/' , (req , res)=>{
     res.json({
            message : 'Server is running up!!!' ,
        });
}) ;


sequelize.sync().then(() => console.log("Database Synced"));
server.listen(5000, () => console.log("Server running on port 5000"));
