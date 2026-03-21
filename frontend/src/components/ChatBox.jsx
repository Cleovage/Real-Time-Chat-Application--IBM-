import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function ChatBox({ messages, user, onSendMessage, onTyping, typingUser }) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
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
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUser && (
        <div className="chat-header">
          <span className="typing-indicator">{typingUser} is typing...</span>
        </div>
      )}

      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSubmit}>
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
