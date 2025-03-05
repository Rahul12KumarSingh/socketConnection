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

  return (
    <div className="chats-container">
      <h1 className="welcome-header">Welcome: {user.name}</h1>

      <div className="chats-content">
        <div className="chats-list">
          <h2>Chats</h2>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat === chat.id ? "active" : ""}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <p>{chat.name}</p>
            </div>
          ))}
        </div>

        <div className="single-chat">
          <SingleChats selectedChat={selectedChat} user={user} />
        </div>
      </div>
    </div>
  );
};

export default Chats;