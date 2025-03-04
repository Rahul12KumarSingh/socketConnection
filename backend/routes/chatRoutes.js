const express = require("express");
const Chat = require("../models/chat");
const ChatUser = require("../models/chatuser");
const User = require("../models/user");

const router = express.Router();

// Create a Group Chat
router.post("/create", async (req, res) => {
  try {
    const {name , users} = req.body;

    console.log("users : " , users);
    
    //creating tje chats....
     const chat =  await Chat.create({name});

     users.map(async (userId) => {
      console.log("userId : "
      , userId);
      await ChatUser.create({ chatId: chat.id,  userId });
    } ) ;

    res.json({
      message: "Chat created",
      chat 
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Chats
router.get("/:userId", async (req, res) => {
  try {

    const userId = req.params.userId;
    console.log("userId : " , userId);

    const chats = await Chat.findAll({ 
      include: { model: User, 
        through : {model : ChatUser} ,
        where: {id : userId} ,
        attributes: []
       }
     });
    res.json(chats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
