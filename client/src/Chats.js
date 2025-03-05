import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Chats.css"; // Import the CSS file
import SingleChats from "./SingleChats";

const Chats = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  

  // Fetch all user chats when component mounts
  useEffect(() => {
    axios.get(`http://localhost:5000/chats/${user.id}`).then((res) => setChats(res.data));
  }, [user.id]);

  // // Fetch messages when a chat is selected
  // const selectChat = (chatId) => {
  //   socket.emit("joinChat", chatId);

  //   axios.get(`http://localhost:5000/messages/${chatId}`).then((res) => {
  //     setMessages(res.data);
  //   });

  //   setSelectedChat(chatId);
  // };


  return (
    <div className="chats-container">
      <h1>Welcome: {user.name}</h1>

      <div className="chats-list">
        <h2>Chats</h2>
        {chats.map((chat) => (
          <div key={chat.id} onClick={() => setSelectedChat(chat.id)}>
            <p>{chat.name}</p>
            <p>{}</p>
          </div>
        ))}
      </div>

      
      <div className="single-chat">
        <SingleChats selectedChat={selectedChat} user={user} />
      </div>

    </div>
  );
};

export default Chats;