import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatPage() {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const messagesEndRef = useRef(null);

  // REDIRECT IF NOT LOGGED IN
  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
    }
  }, []);

  // JOIN SOCKET
  useEffect(() => {
    if (user) {
      socket.emit("join", user._id);
    }
  }, [user]);

  // FETCH USERS
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((res) => setUsers(res.data));
  }, []);

  // ONLINE USERS
  useEffect(() => {
    socket.on("onlineUsers", (data) => {
      setOnlineUsers(data);
    });

    return () => socket.off("onlineUsers");
  }, []);

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // TYPING
  useEffect(() => {
    socket.on("typing", ({ sender }) => {
      setTypingUser(sender);
    });

    socket.on("stopTyping", () => {
      setTypingUser(null);
    });

    return () => {
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, []);

  // LOAD MESSAGES
  useEffect(() => {
    if (!selectedUser) return;

    axios
      .get(`http://localhost:5000/api/messages/${selectedUser._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.log(err.response?.data));
  }, [selectedUser]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!text) return;

    const { data } = await axios.post(
      "http://localhost:5000/api/messages",
      {
        content: text,
        receiver: selectedUser._id,
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    socket.emit("sendMessage", data);
    setMessages((prev) => [...prev, data]);
    setText("");
  };

  // TYPING FUNCTION
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      sender: user._id,
      receiver: selectedUser?._id,
    });

    setTimeout(() => {
      socket.emit("stopTyping", {
        sender: user._id,
        receiver: selectedUser?._id,
      });
    }, 1000);
  };

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: "25%", borderRight: "1px solid gray" }}>
        {users.map((u) => (
          <div key={u._id} onClick={() => setSelectedUser(u)}>
            {u.name}
            {onlineUsers.includes(u._id) && " 🟢"}
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div style={{ width: "75%" }}>
        {selectedUser && (
          <>
            <h3>{selectedUser.name}</h3>

            {typingUser === selectedUser._id && <p>Typing...</p>}

            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.sender === user._id ? "You" : "User"}:</b>{" "}
                {m.content}
                {m.sender === user._id && (
                  <span>{m.seen ? " ✔✔" : " ✔"}</span>
                )}
              </div>
            ))}

            <div ref={messagesEndRef} />

            <input value={text} onChange={handleTyping} />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;