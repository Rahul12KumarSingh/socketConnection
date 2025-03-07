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
    axios.get(`http://localhost:5000/chats/${user.id}`).then((res) => {
      console.log("chats info : ", res.data);
      setChats(res.data.data)
    }) ;
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
              onClick={() =>  setSelectedChat(chat.id)}
            >
              <p  style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>{chat.name}</p>
              <p style={{ margin: "0", color: "#555" }}> <span style={{ fontStyle: "italic" }}>{chat.latestMessage}</span> : <span style={{ fontWeight: "bold", color: "#d9534f" }}>{chat.    unseenMessagesCount}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="single-chat">
          <SingleChats selectedChat={selectedChat} user={user} chats={chats} setChats={setChats} />
        </div>
      </div>
    </div>
  );
};

export default Chats;