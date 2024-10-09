const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
app.use(cors());
app.use(express.json())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose.connect("mongodb://localhost:27017/chatApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB: ", error);
});

// Message schema
const messageSchema = new mongoose.Schema({
  room: String,
  author: String,
  message: String,
  time: String,
});

const Message = mongoose.model("Message", messageSchema);

// API endpoint to save messages
app.post("/api/messages", async (req, res) => {
  const { room, author, message, time } = req.body;

  try {
    const newMessage = new Message({
      room,
      author,
      message,
      time,
    });

    await newMessage.save();
    res.status(201).send("Message saved successfully!");
  } catch (error) {
    res.status(500).send("Error saving message");
  }
});


io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
