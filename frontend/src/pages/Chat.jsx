import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getMessages, getRoomById, joinRoom, deleteRoom as deleteRoomApi, clearChat as clearChatApi } from "../services/api";
import ChatBox from "../components/ChatBox";
import ConfirmModal from "../components/ConfirmModal";

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isCreator = user && room && room.creator === user._id;

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

    // Listen for message edited
    socketRef.current.on("messageEdited", ({ messageId, content, isEdited }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, content, isEdited } : msg
        )
      );
    });

    // Listen for message unsent
    socketRef.current.on("messageUnsent", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true, content: "" } : msg
        )
      );
    });

    // Listen for chat cleared
    socketRef.current.on("chatCleared", () => {
      setMessages([]);
    });

    // Listen for room deleted
    socketRef.current.on("roomDeleted", () => {
      navigate("/rooms");
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

  const handleSendMessage = (content, replyingTo) => {
    if (socketRef.current) {
      const data = {
        sender: user._id,
        senderName: user.username,
        room: roomId,
        content,
        type: "text",
      };

      if (replyingTo) {
        data.replyTo = {
          messageId: replyingTo._id,
          senderName: replyingTo.senderName,
          content: replyingTo.content?.substring(0, 100),
        };
      }

      socketRef.current.emit("sendMessage", data);

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

  const handleEditMessage = (messageId, content) => {
    if (socketRef.current) {
      socketRef.current.emit("editMessage", {
        messageId,
        content,
        sender: user._id,
        roomId,
      });
    }
  };

  const handleUnsendMessage = (messageId) => {
    setConfirmModal({
      isOpen: true,
      title: "Unsend Message",
      message: "This message will be removed for everyone. This action cannot be undone.",
      confirmText: "Unsend",
      variant: "danger",
      onConfirm: () => {
        if (socketRef.current) {
          socketRef.current.emit("unsendMessage", {
            messageId,
            sender: user._id,
            roomId,
          });
        }
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleClearChat = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear All Messages",
      message: "This will permanently delete all messages in this room. This action cannot be undone.",
      confirmText: "Clear All",
      variant: "danger",
      onConfirm: () => {
        if (socketRef.current) {
          socketRef.current.emit("clearChat", { roomId });
        }
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleDeleteRoom = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Room",
      message: `Are you sure you want to delete "${room?.name}"? All messages will be lost permanently.`,
      confirmText: "Delete Room",
      variant: "danger",
      onConfirm: async () => {
        try {
          // Notify socket users first
          if (socketRef.current) {
            socketRef.current.emit("deleteRoom", { roomId });
          }
          // Delete via REST API
          await deleteRoomApi(roomId, { userId: user._id });
          navigate("/rooms");
        } catch (err) {
          console.error("Error deleting room:", err);
        }
        setConfirmModal({ isOpen: false });
      },
    });
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

        {/* Sidebar actions */}
        <div className="sidebar-actions">
          <button
            className="sidebar-action-btn"
            onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
            title="Search messages"
          >
            🔍 Search
          </button>
          {isCreator && (
            <>
              <button
                className="sidebar-action-btn danger-text"
                onClick={handleClearChat}
                title="Clear all messages"
              >
                🗑️ Clear Chat
              </button>
              <button
                className="sidebar-action-btn danger-text"
                onClick={handleDeleteRoom}
                title="Delete this room"
              >
                ❌ Delete Room
              </button>
            </>
          )}
        </div>

        {/* Search input */}
        {showSearch && (
          <div className="sidebar-search">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        )}

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
        onEditMessage={handleEditMessage}
        onUnsendMessage={handleUnsendMessage}
        searchQuery={searchQuery}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
}

export default Chat;
