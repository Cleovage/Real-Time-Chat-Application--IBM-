import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

const EMOJI_LIST = [
  "😀", "😂", "😍", "🤔", "😢", "🔥", "👍", "👎",
  "❤️", "🎉", "💯", "😎", "🙌", "✅", "⭐", "💬",
];

function ChatBox({ messages, user, onSendMessage, onTyping, typingUser, onReaction }) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
      setShowEmojis(false);
    }
  };

  const insertEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  return (
    <div className="chat-main">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No messages yet</h3>
            <p>Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg._id || index}
              message={msg}
              isOwn={msg.sender === user?._id}
              onReaction={onReaction}
              userId={user?._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="typing-bar">
          <span className="typing-indicator">{typingUser} is typing...</span>
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
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (onTyping) onTyping();
            }}
            id="chat-message-input"
          />
          <button type="submit" className="chat-send-btn" id="chat-send-btn">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBox;
