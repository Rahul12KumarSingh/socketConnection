const express = require("express");
const Chat = require("../models/chat");
const ChatUser = require("../models/chatuser");
const User = require("../models/user");
const sequelize = require("../config/database");

const router = express.Router();

// Create a Group Chat...
router.post("/create", async (req, res) => {
  try {
    const {name , users} = req.body;

    console.log("users : " , users);
    
    //creating the chats....
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
// router.get("/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     console.log("userId : " , userId);

    

//     const chats = await Chat.findAll({ 
//       include: { model: User, 
//         through : {model : ChatUser} ,
//         where: {id : userId} ,
//         attributes: []
//        }
//      });



//     res.json(chats);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// Get All chats with unseen messages count.....
router.get("/:userId" , async (req , res) => {
     try {
      const userId = req.params.userId;
      console.log("userId : " , userId);
  
      const chats = await Chat.findAll({ 
        include: [
          {
            model: User, 
            through: { model: ChatUser },
            where: { id: userId },
            attributes: []
          }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT unSeencount
                FROM ChatUsers AS ChatUser
                WHERE
                  ChatUser.chatId = Chat.id
                  AND ChatUser.userId = ${userId}
              )`),
              'unseenMessagesCount'
            ]
          ]
        }
      });

      console.log("chats : " , chats);

      res.json({
          success: true,
          data: chats
      });


     } catch (error) {
        res.status(400).json({ error: error.message });
     }    
} ) ;


//making the user inactive in the particular chat...
router.put("/:chatId" , async (req , res) => {
  const userId = req.query.userId;

  try {
    await ChatUser.update(
      {isActive : false},
      {where : {chatId : req.params.chatId , userId : userId}}
    );

    res.json({message : "User is inactive in the chat"});
  }catch (error) {
    res.status(400).json({ error: error.message });
  }
}) 


//finding all the  user present in the chat....
router.get("/users/:chatId" , async (req , res) => {
  try {
    const chatId = req.params.chatId;
    console.log("chatId : " , chatId);

    const users = await ChatUser.findAll({
      where: { chatId },
      attributes: [],
      include: [{ model: User, attributes: ["id", "name"] }],
    });

    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}) ;



module.exports = router ;
