import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getMessages, getRoomById, joinRoom } from "../services/api";
import ChatBox from "../components/ChatBox";

// Dynamically resolve the socket server so it works over WiFi too
const SOCKET_URL = `http://${window.location.hostname}:3002`;

function Chat({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch room details and messages
    const fetchData = async () => {
      try {
        const [roomRes, messagesRes] = await Promise.all([
          getRoomById(roomId),
          getMessages(roomId),
        ]);
        setRoom(roomRes.data);
        setMessages(messagesRes.data.messages || []);

        // Auto-join the room if not a member
        const isMember = roomRes.data.members?.some(
          (m) => m.userId === user._id
        );
        if (!isMember) {
          await joinRoom(roomId, {
            userId: user._id,
            username: user.username,
          });
        }
      } catch (err) {
        console.error("Error fetching chat data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Connect to Socket.IO
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      socketRef.current.emit("joinRoom", {
        roomId,
        username: user.username,
        userId: user._id,
      });
    });

    // Listen for new messages
    socketRef.current.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for online users updates
    socketRef.current.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Listen for reaction updates
    socketRef.current.on("messageReaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          (msg._id === messageId) ? { ...msg, reactions } : msg
        )
      );
    });

    // Listen for typing indicators
    socketRef.current.on("typing", ({ username }) => {
      setTypingUser(username);
    });

    socketRef.current.on("stopTyping", () => {
      setTypingUser(null);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveRoom", {
          roomId,
          username: user.username,
        });
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, navigate]);

  const handleSendMessage = (content) => {
    if (socketRef.current) {
      socketRef.current.emit("sendMessage", {
        sender: user._id,
        senderName: user.username,
        room: roomId,
        content,
        type: "text",
      });

      // Stop typing indicator
      socketRef.current.emit("stopTyping", {
        roomId,
        username: user.username,
      });
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit("typing", {
        roomId,
        username: user.username,
      });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stopTyping", {
          roomId,
          username: user.username,
        });
      }, 2000);
    }
  };

  const handleReaction = (messageId, emoji) => {
    if (socketRef.current) {
      socketRef.current.emit("addReaction", {
        messageId,
        emoji,
        userId: user._id,
        username: user.username,
        roomId,
      });
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading" style={{ width: "100%" }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Sidebar with room info and members */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3>{room?.name || "Chat Room"}</h3>
          <p className="room-info">{room?.description || "No description"}</p>
        </div>
        <div className="members-list">
          <div className="members-label">
            Online — {onlineUsers.length}
          </div>
          {room?.members?.map((member, index) => {
            const isOnline = onlineUsers.some(
              (u) => u.username === member.username
            );
            return (
              <div key={index} className="member-item">
                <div className={`member-avatar ${isOnline ? "online" : ""}`}>
                  {member.username?.charAt(0).toUpperCase()}
                  {isOnline && <span className="online-dot" />}
                </div>
                <span className="member-name">{member.username}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main chat area */}
      <ChatBox
        messages={messages}
        user={user}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        typingUser={typingUser}
        onReaction={handleReaction}
      />
    </div>
  );
}

export default Chat;
