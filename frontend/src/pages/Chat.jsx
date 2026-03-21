import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getMessages, getRoomById, joinRoom } from "../services/api";
import ChatBox from "../components/ChatBox";

const SOCKET_URL = "http://localhost:3002";

function Chat({ user }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
      });
    });

    // Listen for new messages
    socketRef.current.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
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
          <div style={{ padding: "8px 12px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
            Members — {room?.members?.length || 0}
          </div>
          {room?.members?.map((member, index) => (
            <div key={index} className="member-item">
              <div className="member-avatar">
                {member.username?.charAt(0).toUpperCase()}
              </div>
              <span className="member-name">{member.username}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <ChatBox
        messages={messages}
        user={user}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        typingUser={typingUser}
      />
    </div>
  );
}

export default Chat;
