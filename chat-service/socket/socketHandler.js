const Message = require("../models/messageModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat room
    socket.on("joinRoom", ({ roomId, username }) => {
      socket.join(roomId);
      console.log(`${username} joined room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("message", {
        sender: "system",
        senderName: "System",
        content: `${username} has joined the chat`,
        type: "system",
        room: roomId,
        createdAt: new Date(),
      });
    });

    // Leave a chat room
    socket.on("leaveRoom", ({ roomId, username }) => {
      socket.leave(roomId);
      console.log(`${username} left room: ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit("message", {
        sender: "system",
        senderName: "System",
        content: `${username} has left the chat`,
        type: "system",
        room: roomId,
        createdAt: new Date(),
      });
    });

    // Send a message
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, senderName, room, content, type } = data;

        // Save message to database
        const message = await Message.create({
          sender,
          senderName,
          room,
          content,
          type: type || "text",
        });

        // Broadcast message to everyone in the room
        io.to(room).emit("message", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", ({ roomId, username }) => {
      socket.to(roomId).emit("typing", { username });
    });

    // Stop typing indicator
    socket.on("stopTyping", ({ roomId, username }) => {
      socket.to(roomId).emit("stopTyping", { username });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
