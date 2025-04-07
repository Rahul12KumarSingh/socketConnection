import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import "./MessageInputBox.css";

const MessageInputBox = ({ onSend, groupUser }) => {
    console.log("groupUser : ", groupUser);

    const [text, setText] = useState("");
    const [Documents, setDocuments] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [showUserList, setShowUserList] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [mentions, setMentions] = useState([]);


    const fileInputRef = useRef(null);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        setText(e.target.innerText);
    };

    useEffect(() => {
        if (text.includes("@")) {
            const lastWord = text.split(" ").pop();

            console.log("lastword : " , lastWord) ;

            if (lastWord.startsWith("@")) {
                const serchKeyword = lastWord.slice(1).toLowerCase();

                setFilteredUsers(
                    groupUser.filter((user) => user.name.toLowerCase().includes(serchKeyword))
                );

                setShowUserList(true);
                
            } else {
                setShowUserList(false);
            }
        } else {
            setShowUserList(false);
        }

    }, [text]);


    const handleUserSelect = (user) => {
        const newText = text.replace(/@\w*$/, `${user.name}`);

        setText((prevText) => prevText + newText);

        // console.log("new user selected  : " ,{user.name , newText}) ;

        if (inputRef.current) {
            inputRef.current.innerText += newText;
        }

        setMentions((prev) => [...prev, user]);
        setShowUserList(false);
    }



    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newDocs = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setDocuments((prev) => [...prev, ...newDocs]);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.startsWith("image/")) {
                const file = item.getAsFile();
                setDocuments((prev) => [...prev, { file, preview: URL.createObjectURL(file) }]);
            }
        }
    };

    const addEmoji = (emojiObject) => {
        const emoji = emojiObject.emoji;
        setText((prevText) => prevText + emoji);

        if (inputRef.current) {
            inputRef.current.innerText += emoji;
        }

        setShowEmojiPicker(false);
    };



    const uploadDocumentToGcs = async () => {
        const uploadedDocumentUrls = [];
        for (const doc of Documents) {
            const file = doc.file;
            try {
                const response = await axios.get(
                    `http://localhost:5000/generateSignedUrl?fileName=${file.name}&fileType=${file.type}`
                );

                const { signedUrl } = response.data;

                console.log("signedUrl : ", signedUrl);

                await axios.put(signedUrl, file, {
                    headers: { "Content-Type": file.type },
                });

                const publicUrl = signedUrl.split("?")[0];
                uploadedDocumentUrls.push(publicUrl);

            } catch (error) {
                console.error("Error uploading file: ", error.message);
            }
        }


        return uploadedDocumentUrls;
    };

    const handleSend = async () => {
        if (text.trim() || Documents.length > 0) {
            const uploadedDocumentUrls = await uploadDocumentToGcs();
            // console.log("uploadedDocumentUrls : ", uploadedDocumentUrls);

            console.log("mentions : ", mentions);

            const mentionedNames = mentions.map((user) => user.name);

            let filteredText = text ;

            mentionedNames.forEach((name) => {
                const regex = new RegExp(`@${name}\\b`, "g");  
                filteredText = filteredText.replace(regex,"").trim() ;
            });

            const mentionUsers = mentions.map((user) => user.id);

            onSend(filteredText , uploadedDocumentUrls,
                mentionUsers
            );

            setText("");
            setDocuments([]);
            if (inputRef.current) {
                inputRef.current.innerText = "";
            }
            setMentions([]);
        }
    };

    return (
        <div className="chat-input-container">
            <div
                contentEditable
                ref={inputRef}
                className="input-box"
                onInput={handleInputChange}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
                data-placeholder="Type a message..."
            />

            {
                showUserList && (
                    <ul className="mention-list">
                        {filteredUsers.map((user) => (
                            <li key={user.id} onClick={() => handleUserSelect(user)}>
                                @{user.name}
                            </li>
                        ))}
                    </ul>
                )
            }

            {
                showEmojiPicker && (
                    <div className="emoji-picker">
                        <EmojiPicker onEmojiClick={addEmoji} />
                    </div>
                )
            }

            <input
                type="file"
                ref={fileInputRef}
                accept="*"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            <div className="action-buttons">
                <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    😊
                </button>

                <button className="upload-btn" onClick={() => fileInputRef.current.click()}>
                    📷
                </button>

                <button className="send-btn" onClick={handleSend}>Send</button>
            </div>

            <div className="image-preview">
                {Documents.map((docs, idx) => (
                    <div key={idx} className="preview-item">
                        <img src={docs.preview} alt="preview" />
                        <button onClick={() => setDocuments(Documents.filter((_, i) => i !== idx))}>❌</button>
                    </div>
                ))}
            </div>

        </div>
    );
};




export default MessageInputBox;
