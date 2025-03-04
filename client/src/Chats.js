import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000");

const Chats = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/chats/${user.id}`).then((res) => setChats(res.data));
  }, []);

  useEffect(() => {
      
    socket.on("receiveMessage", (msg) => {
      console.log("msg : " , msg);
      setMessages((prev) => [...prev, msg]);
    });
  
    return () => socket.off("receiveMessage");
  }) ;
  
  const selectChat = (chatId) => {
    setSelectedChat(chatId);
    socket.emit("joinChat", chatId);

    axios.get(`http://localhost:5000/messages/${chatId}`).then((res) => setMessages(res.data));
  };

  const sendMessage = async() => {

    //for creating the new message inside the database...
    const res = await  axios.post("http://localhost:5000/messages/send", { chatId: selectedChat, senderId: user.id, content: newMessage });

    //for sending the message to the socket...
    socket.emit("sendMessage", { chatId: selectedChat, senderId: user.id, content: newMessage });

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
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default Chats;
