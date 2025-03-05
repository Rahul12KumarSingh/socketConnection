import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chats.css";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;

export default function SingleChats({ user, selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notification, setNotification] = useState([]);

  // Fetch messages when a chat is selected
  const fetchMessage = async () => {
    if (!selectedChat) return;

    const { data } = await axios.get(`http://localhost:5000/messages/${selectedChat}`);
    setMessages(data);
    socket.emit("joinChat", selectedChat);
  };

  useEffect(() => {
    fetchMessage();
  }, [selectedChat]);

  // Send Message
  const sendMessage = async () => {
    if (!newMessage) return;

    const { data } = await axios.post("http://localhost:5000/messages/send", {
      chatId: selectedChat,
      senderId: user.id,
      content: newMessage,
    });

    socket.emit("sendMessage", data);
    setMessages([...messages, data]);
    setNewMessage("");
  };

  // Socket setup
  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("connected", () => {
      console.log("Connected to server");
    });

    socket.emit("setup", user);
  }, []);

  // Handle incoming messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (msg.chatId !== selectedChat) {
        setNotification((prev) => [...prev, msg]);
      }
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedChat]);

  return (
    <div className="messages-section">
      {selectedChat ? (
        <>
          <h3>Messages</h3>
          <div className="messages-list">
            {messages.map((m) => (
             
              <div className={m.senderId == user.id ? "apnamessage" : "dusrekamessage" } key={m.id}>
                {m.senderId  } : {m.content}</div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      ) : (
        <div >No Chat Selected</div>
      )}
    </div>
  );
}