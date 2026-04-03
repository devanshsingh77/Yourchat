const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// routes
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes"); // ✅ FIXED NAME

// models
const Message = require("./models/messageModel");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));

/* ---------------- ERROR HANDLER ---------------- */

app.use(notFound);
app.use(errorHandler);

/* ---------------- HTTP SERVER ---------------- */

const server = http.createServer(app);

/* ---------------- SOCKET SERVER ---------------- */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

/* ---------------- ONLINE USERS ---------------- */

const onlineUsers = new Map();

/* ---------------- SOCKET CONNECTION ---------------- */

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  /* ---------- JOIN ---------- */
  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId);
    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    io.emit("onlineUsers", [...onlineUsers.keys()]);
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", ({ sender, receiver }) => {
    io.to(receiver).emit("typing", sender);
  });

  socket.on("stopTyping", ({ sender, receiver }) => {
    io.to(receiver).emit("stopTyping", sender);
  });

  /* ---------- SEND MESSAGE ---------- */
  socket.on("sendMessage", async (data) => {
    try {
      if (!data?.sender || !data?.receiver || !data?.content) return;

      const newMessage = await Message.create({
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        seen: false,
      });

      // SEND TO RECEIVER
      io.to(data.receiver).emit("receiveMessage", newMessage);

      // SEND BACK TO SENDER
      io.to(data.sender).emit("messageSent", newMessage);

    } catch (err) {
      console.log("❌ Message Error:", err.message);
    }
  });

  /* ---------- MESSAGE SEEN ---------- */
  socket.on("messageSeen", async ({ messageId, sender }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { seen: true });

      io.to(sender).emit("messageSeen", messageId);
    } catch (err) {
      console.log("Seen Error:", err.message);
    }
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    const userId = socket.userId;

    if (userId && onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);

      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
      }

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    }

    console.log("🔴 User Disconnected:", socket.id);
  });
});

/* ---------------- DATABASE ---------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(5000, () => {
      console.log("🚀 Server running on port 5000");
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err.message);
  });