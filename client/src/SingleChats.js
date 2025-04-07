import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Chats.css";
import io from "socket.io-client";
import MessageInputBox from "./MessageInputBox";

const ENDPOINT = "http://localhost:5000";
let socket;


export default function SingleChats({ user, chats, setChats, selectedChat }) {

  const renderMedia = (url) => {
    if (!url) return null;

    const fileExtension = url.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      return <img src={url} alt="Image" className="media-image" />;
    }
    if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
      return <video controls className="media-video">
        <source src={url} type={`video/${fileExtension}`} />
        Your browser does not support the video tag.
      </video>;
    }
    if (['pdf'].includes(fileExtension)) {
      return <iframe src={url} className="media-pdf" title="PDF Document" />;
    }

    return <a href={url} target="_blank" rel="noopener noreferrer">Download File</a>;
  };


  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [notification, setNotification] = useState([]);
  const [userInGroup, setUserInGroup] = useState([]);

  const [downloadProgress, setDownloadProgress] = useState({});

  const processedMessage = useRef();


  const [file, setFile] = useState(null);

  //logics for the upload files....
  const handleFileChange = async (e) => {
    setFile(e.target.files[0]);
  }


  // Fetch messages when a chat is selected
  const fetchMessage = async () => {
    if (!selectedChat) return;

    //join the room......
    socket.emit("joinChat", selectedChat);

    var { data } = await axios.get(`http://localhost:5000/messages/${selectedChat}?userId=${user.id}`);

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


    //fetch all the users present in this chatGroup....
    var { data } = await axios.get(`http://localhost:5000/chats/users/${selectedChat}`);

    data.map((dataNode) => {
      setUserInGroup((prev) => [...prev, dataNode.User])
    })

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
  const sendMessage = async (text, docsUrl, mentionUsers) => {

    console.log("mentioned users : ", mentionUsers);

    if (!text && !docsUrl) return;

    //upload the images at the cloud storage....
    const { data } = await axios.post("http://localhost:5000/messages/send", {
      chatId: selectedChat,
      senderId: user.id,
      senderName: user.name,
      content: text,
      documentUrl: docsUrl,
      tagedMember: mentionUsers
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
                <div>
                  <strong>{m?.senderName}</strong>

                  {/* Check if documentUrl exists and render based on its type */}
                  {m?.documentUrl && (
                    <div className="document-container">
                      {Array.isArray(m.documentUrl) ? (
                        m.documentUrl.map((url, index) => (
                          <div key={index} className="media-preview">
                            {renderMedia(url)}
                          </div>
                        ))
                      ) : (
                        renderMedia(m.documentUrl)
                      )}
                    </div>
                  )}

                  <div>{
                    m?.tagedMember.map((memberId) => (
                      <span key={memberId} className="mention-tag">
                        @{userInGroup.find(user => user.id === memberId)?.name}
                      </span>
                    ))
                  }
                     {m.content}
                  </div>
              </div>
              </div>
            ))}
        </div>


      <MessageInputBox onSend={sendMessage} groupUser={userInGroup} />
    </>
  ) : (
    <div >No Chat Selected</div>
  )
}
    </div >
  );
}