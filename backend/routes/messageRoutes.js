const express = require("express");
const Message = require("../models/message");
const ChatUser = require("../models/chatuser");
const Chat = require("../models/chat");

const sequelize = require("../config/database");
const { Op } = require("sequelize");

const router = express.Router();

// Send Message
router.post("/send", async (req, res) => {
  try {
    const { chatId, senderId , senderName , content , documentUrl , tagedMember} = req.body;

    console.log("documentUrl : " , documentUrl);

    
    // console.log("imgUrl : " , imgUrl)
    const message = await Message.create({ chatId, senderId , senderName , content  , documentUrl , tagedMember});

    //increment the unseen count of the each user in the chat 
    await ChatUser.update(
      {
        unSeencount : sequelize.literal('unSeencount + 1') ,
      },
      {where : {chatId : chatId , isActive : false}}
    );

    //update the latest message in the chat.....
    await Chat.update(
      {
        latestMessage : content ,
      },
      {where : {id : chatId}}
    );

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Messages in a Group
router.get("/:chatId", async (req, res) => {
  console.log("chatId : " , req.params.chatId);
  const userId = req.query.userId;

  console.log("userId : " , userId);  

  try{
    const messages = await Message.findAll({ where: { chatId: req.params.chatId } });

    //reset the unseen count of the user in the chat...
    await ChatUser.update(
      {unSeencount : 0 , isActive : true},
      {where : {chatId : req.params.chatId , userId : userId}}
    );

    res.json(messages);
  } catch (error) {
    res.status(400).json({error: error.message });
  }
});

//..//

module.exports = router;
