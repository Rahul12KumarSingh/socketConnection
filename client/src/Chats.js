import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chats = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all user chats when component mounts
  useEffect(() => {
    axios.get(`http://localhost:5000/chats/${user.id}`).then((res) => setChats(res.data));
  }, []);

  // Fetch messages when a chat is selected
  const selectChat = (chatId) => {
    socket.emit("joinChat", chatId);

    axios.get(`http://localhost:5000/messages/${chatId}`).then((res) => {
      setMessages(res.data);
    });

    setSelectedChat(chatId);
  };

  // Listen for new messages
  useEffect(() => {
    
    const handleNewMessage = (msg) => {
      console.log("New Message Received:", msg);
     
      setMessages((prevMessages) => [...prevMessages, msg]); 
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage); // Cleanup listener
    };
  }, []); 

  // Send Message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const res = await axios.post("http://localhost:5000/messages/send", {
      chatId: selectedChat,
      senderId: user.id,
      content: newMessage,
    });

    socket.emit("sendMessage", res.data); 

    setMessages((prev) => [...prev, res.data]); 
    setNewMessage("");
  };

  return (
    <div>
      <h2>Chats</h2>
      {chats.map((chat) => (
        <div key={chat.id} onClick={() => selectChat(chat.id)}>
          <p>{chat.name}</p>
        </div>
      ))}

      {selectedChat && (
        <div>
          <h3>Messages</h3>
          {messages.map((msg, i) => (
            <p key={i}>{msg.content}</p>
          ))}
          <input
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default Chats;
