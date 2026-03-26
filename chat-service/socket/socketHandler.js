const Message = require("../models/messageModel");

// Track online users per room: Map<roomId, Map<socketId, { userId, username }>>
const roomUsers = new Map();

function getOnlineList(roomId) {
  const users = roomUsers.get(roomId);
  if (!users) return [];
  // Deduplicate by username (same user might have multiple tabs)
  const seen = new Set();
  const list = [];
  for (const u of users.values()) {
    if (!seen.has(u.username)) {
      seen.add(u.username);
      list.push(u);
    }
  }
  return list;
}

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // ---- Join a chat room ----
    socket.on("joinRoom", ({ roomId, username, userId }) => {
      socket.join(roomId);

      // Track this socket in the room
      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, { userId, username });
      // Remember which room this socket is in (for disconnect cleanup)
      socket.data.roomId = roomId;
      socket.data.username = username;

      console.log(`${username} joined room: ${roomId}`);

      // Notify others
      socket.to(roomId).emit("message", {
        sender: "system",
        senderName: "System",
        content: `${username} has joined the chat`,
        type: "system",
        room: roomId,
        createdAt: new Date(),
      });

      // Broadcast updated online list
      io.to(roomId).emit("onlineUsers", getOnlineList(roomId));
    });

    // ---- Leave a chat room ----
    socket.on("leaveRoom", ({ roomId, username }) => {
      socket.leave(roomId);

      // Remove from tracking
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        if (roomUsers.get(roomId).size === 0) roomUsers.delete(roomId);
      }

      console.log(`${username} left room: ${roomId}`);

      socket.to(roomId).emit("message", {
        sender: "system",
        senderName: "System",
        content: `${username} has left the chat`,
        type: "system",
        room: roomId,
        createdAt: new Date(),
      });

      // Broadcast updated online list
      io.to(roomId).emit("onlineUsers", getOnlineList(roomId));
    });

    // ---- Send a message ----
    socket.on("sendMessage", async (data) => {
      try {
        const { sender, senderName, room, content, type } = data;

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

    // ---- Message reactions ----
    socket.on("addReaction", async ({ messageId, emoji, userId, username, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Remove existing reaction from this user on this emoji (toggle)
        const existingIdx = message.reactions.findIndex(
          (r) => r.userId === userId && r.emoji === emoji
        );

        if (existingIdx >= 0) {
          message.reactions.splice(existingIdx, 1);
        } else {
          message.reactions.push({ emoji, userId, username });
        }

        await message.save();

        // Broadcast updated reactions to everyone in the room
        io.to(roomId).emit("messageReaction", {
          messageId: message._id,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error("Error adding reaction:", error);
      }
    });

    // ---- Typing indicators ----
    socket.on("typing", ({ roomId, username }) => {
      socket.to(roomId).emit("typing", { username });
    });

    socket.on("stopTyping", ({ roomId, username }) => {
      socket.to(roomId).emit("stopTyping", { username });
    });

    // ---- Disconnect cleanup ----
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      const roomId = socket.data.roomId;
      const username = socket.data.username;

      if (roomId && roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }

        // Notify remaining users
        if (username) {
          io.to(roomId).emit("message", {
            sender: "system",
            senderName: "System",
            content: `${username} has left the chat`,
            type: "system",
            room: roomId,
            createdAt: new Date(),
          });
        }

        io.to(roomId).emit("onlineUsers", getOnlineList(roomId));
      }
    });
  });
};

module.exports = socketHandler;
