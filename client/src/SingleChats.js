import { use } from 'react';
import React, { useEffect } from 'react'
import { useState} from 'react';
import axios from 'axios';
import "./Chats.css";

import io from "socket.io-client"
const ENDPOINT = "http://localhost:5000"; 


var  socket ;

export default function SingleChats({ user , selectedChat }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    
    const [notification, setNotification] = useState([]) ;
    

    const fetchMessage = async () => {
        if (!selectedChat) return;

        const { data } = await axios.get(`http://localhost:5000/messages/${selectedChat}`);

        setMessages(data);
        socket.emit("joinChat", selectedChat);
    }

    useEffect(()=>{
         fetchMessage() ;
    } , [selectedChat]) ;
 
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


    useEffect(() => {
        socket = io(ENDPOINT);

        socket.emit("connected", () => {
            console.log('Connected to server');
        });

        socket.emit("setup", user);
    }, [])


    // useEffect(()=>{
    //    socket.on("receiveMessage", (data) => {
    //       console.log("data info : " , data);
    //       console.log("selectedChat info : " , selectedChat);


    //         if(data.chatId !== selectedChat)     
    //               {
    //                  //add to the notification...
    //                  console.log("new message info : " , data);
    //               }

    //         setMessages([...messages, data.content]);
    //     });

        
    // } , [selectedChat]) ;


    useEffect(() => {
        const handleReceiveMessage = (msg) => {

            if (msg.chatId != selectedChat) {
                setNotification((prev) => [...prev, msg]);
            }

          setMessages((prev) => [...prev, msg]); 
        };



        socket.on("receiveMessage", handleReceiveMessage);
        return () => socket.off("receiveMessage", handleReceiveMessage);
      }, []);

    return (
        <div>
            {selectedChat ? (
                <div className="messages-section">
                    <h3>Messages</h3>
                    <div className="messages-list">
                        {messages && messages.map((m , i) => (
                            <p key={m.id}>{m.content}</p>
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
                </div>
            )

                : <div>No Chat Selected</div>
            }
        </div>
    )
}
