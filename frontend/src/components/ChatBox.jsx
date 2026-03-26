import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const EMOJI_LIST = [
  "😀", "😂", "😍", "🤔", "😢", "🔥", "👍", "👎",
  "❤️", "🎉", "💯", "😎", "🙌", "✅", "⭐", "💬",
];

function ChatBox({
  messages,
  user,
  onSendMessage,
  onTyping,
  typingUser,
  onReaction,
  onEditMessage,
  onUnsendMessage,
  onReply,
  searchQuery,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const emojiRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    // Only auto-scroll if user is near the bottom
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Scroll detection for "scroll to bottom" button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      setShowScrollBtn(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (editingMessage) {
      // Edit mode
      onEditMessage(editingMessage._id, newMessage.trim());
      setEditingMessage(null);
    } else {
      // Send mode (with optional reply)
      onSendMessage(newMessage.trim(), replyingTo);
      setReplyingTo(null);
    }

    setNewMessage("");
    setShowEmojis(false);
  };

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setNewMessage(message.content);
    inputRef.current?.focus();
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Filter messages based on search query
  const displayMessages = searchQuery
    ? messages.filter(
        (msg) =>
          msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="chat-main">
      <div className="chat-messages" ref={messagesContainerRef}>
        {displayMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{searchQuery ? "🔍" : "💬"}</div>
            <h3>{searchQuery ? "No results found" : "No messages yet"}</h3>
            <p>{searchQuery ? "Try a different search term" : "Be the first to send a message!"}</p>
          </div>
        ) : (
          displayMessages.map((msg, index) => (
            <MessageBubble
              key={msg._id || index}
              message={msg}
              isOwn={msg.sender === user?._id}
              onReaction={onReaction}
              userId={user?._id}
              onEdit={handleEdit}
              onUnsend={(msg) => onUnsendMessage(msg._id)}
              onReply={handleReply}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          className="scroll-to-bottom-btn"
          onClick={() => scrollToBottom()}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}

      {typingUser && (
        <div className="typing-bar">
          <span className="typing-indicator">{typingUser} is typing...</span>
        </div>
      )}

      {/* Reply bar */}
      {replyingTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <span className="reply-bar-label">Replying to </span>
            <span className="reply-bar-sender">{replyingTo.senderName}</span>
            <span className="reply-bar-text">{replyingTo.content?.substring(0, 60)}{replyingTo.content?.length > 60 ? '...' : ''}</span>
          </div>
          <button className="reply-bar-close" onClick={handleCancelReply}>✕</button>
        </div>
      )}

      {/* Edit bar */}
      {editingMessage && (
        <div className="edit-bar">
          <div className="edit-bar-content">
            <span className="edit-bar-label">✏️ Editing message</span>
          </div>
          <button className="edit-bar-close" onClick={handleCancelEdit}>✕</button>
        </div>
      )}

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="emoji-wrapper" ref={emojiRef}>
            <button
              type="button"
              className="emoji-toggle-btn"
              onClick={() => setShowEmojis(!showEmojis)}
              title="Add emoji"
              id="emoji-toggle-btn"
            >
              😀
            </button>
            {showEmojis && (
              <div className="emoji-picker">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-item"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (onTyping) onTyping();
            }}
            id="chat-message-input"
          />
          <button
            type="submit"
            className={`chat-send-btn ${editingMessage ? "chat-save-btn" : ""}`}
            id="chat-send-btn"
          >
            {editingMessage ? "✓" : "➤"}
          </button>
          {editingMessage && (
            <button
              type="button"
              className="chat-cancel-btn"
              onClick={handleCancelEdit}
              title="Cancel edit"
            >
              ✕
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
