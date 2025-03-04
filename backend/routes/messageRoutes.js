const express = require("express");
const Message = require("../models/message");

const router = express.Router();

// Send Message
router.post("/send", async (req, res) => {
  try {
    const { chatId, senderId, content } = req.body;
    const message = await Message.create({ chatId, senderId, content });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Messages in a Group
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.findAll({ where: { chatId: req.params.chatId } });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
