import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Chats.css";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
let socket;



export default function SingleChats({ user, chats, setChats, selectedChat }) {


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notification, setNotification] = useState([]);

  const [downloadProgress, setDownloadProgress] = useState({});

  const processedMessage = useRef();


  const [file, setFile] = useState(null);

  //logics for the upload files....
  const handleFileChange = async (e) => {
    setFile(e.target.files[0]);
  }

  const uploadFile = async () => {
    const response = await axios.get(`http://localhost:5000/generateSignedUrl?fileName=${file.name}&fileType=${file.type}`);

    console.log("Response : ", response);

    const { signedUrl } = response.data;

    console.log("signed url : ", signedUrl);

    await axios.put(signedUrl, file, {
      headers: {
        'Content-Type': file.type
      },
    });

    console.log("File uploaded successfully", signedUrl.split("?")[0]);

  }

  // Fetch messages when a chat is selected
  const fetchMessage = async () => {
    if (!selectedChat) return;

    //join the room......
    socket.emit("joinChat", selectedChat);

    const { data } = await axios.get(`http://localhost:5000/messages/${selectedChat}?userId=${user.id}`);

    console.log("Messages  : ", data);

    //update the unseen message count of that chat to 0...
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === selectedChat) {
          return { ...chat, unseenMessagesCount: 0 };
        }
        return chat;
      })
    );

    setMessages(data);
  };

  const makeUserInactiveForSelectedChat = async () => {
    if (selectedChat) {
      console.log("makeUserInactiveForSelectedChat : ", selectedChat);
      await axios.put(`http://localhost:5000/chats/${selectedChat}?userId=${user.id}`);
    }
  }

  useEffect(() => {
    fetchMessage();

    return () => {
      makeUserInactiveForSelectedChat(selectedChat);
    };

  }, [selectedChat]);

  //Send Message....
  const sendMessage = async () => {
    console.log("user info : ", user);

    if (!newMessage) return;

    const { data } = await axios.post("http://localhost:5000/messages/send", {
      chatId: selectedChat,
      senderId: user.id,
      senderName: user.name,
      content: newMessage,
    });

    socket.emit("sendMessage", data);
    setMessages([...messages, data]);


    //update the latest message in the chat
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === selectedChat) {
          return { ...chat, latestMessage: newMessage };
        }
        return chat;
      })
    );

    setNewMessage("");

  };

  // Socket setup
  useEffect(() => {
    socket = io(ENDPOINT);

    socket.emit("connected", () => {
      console.log("Connected to server");
    });

    socket.emit("setup", user.id);
  }, []);

  //Handle incoming messages......
  useEffect(() => {
    const handleReceiveMessage = (msg) => {

      if (processedMessage.current === msg.id) return;

      processedMessage.current = msg.id;

      console.log("Message received from server : ", msg);

      if (msg.chatId !== selectedChat) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === msg.chatId) {
              return { ...chat, unseenMessagesCount: chat.unseenMessagesCount + 1, latestMessage: msg.content };
            }
            return chat;
          })
        );
      }
      else {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === msg.chatId) {
              return { ...chat, latestMessage: msg.content };
            }
            return chat;
          })
        );

        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedChat]);

  //....//
  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log("Percent : ", percent);
          setDownloadProgress((prev) => ({ ...prev, [fileName]: percent }));
        }
      })

      const blob = new Blob([response.data]);
      const fileURL = URL.createObjectURL(blob);


      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      //opening the file when it is downloaded...
      // window.open(fileUrl);
    }
    catch (err) {
      console.log("error happen in downloading the file : ", err.message);
    }
  }

  return (
    <div className="messages-section">
      {selectedChat ? (
        <>
          <h3>Messages</h3>
          <div className="messages-list">
            {messages.map((m) => (

              <div className={m.senderId == user.id ? "apnamessage" : "dusrekamessage"} key={m.id}>
                {m.senderName} : {m.content}</div>
            ))}
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            {downloadProgress["Rahul Resume"] !== undefined && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "5px",
                  borderRadius: "5px",
                  fontSize: "12px",
                }}
              >
                {downloadProgress["Rahul Resume"]}% Downloaded
              </div>
            )}

            <embed
              src="https://storage.googleapis.com/chatappstorage/rahulfinal.pdf"
              type="application/pdf"
              width="150px"
              height="150px"
              style={{ cursor: "pointer", border: "1px solid black" }}
              onClick={() => downloadFile("https://storage.googleapis.com/chatappstorage/rahulfinal.pdf", "Rahul Resume")}
            />
          </div>


          <div className="message-input">

            <input
              type="file"
              onChange={handleFileChange}
            />

            <button onClick={uploadFile}>Upload</button>



            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();;
                }
              }}
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