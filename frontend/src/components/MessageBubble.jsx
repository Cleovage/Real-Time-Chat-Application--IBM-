import { useState, useRef, useEffect } from "react";

// Pool of pleasant colors for chat participants
const USER_COLORS = [
  "#6C8EFF", "#34D399", "#F472B6", "#FBBF24", "#A78BFA",
  "#FB923C", "#2DD4BF", "#38BDF8", "#E879F9", "#4ADE80",
];

const REACT_EMOJIS = ["👍", "❤️", "😂", "🔥", "😮"];

const colorCache = {};
let colorIndex = 0;

function getUserColor(senderName) {
  if (!colorCache[senderName]) {
    colorCache[senderName] = USER_COLORS[colorIndex % USER_COLORS.length];
    colorIndex++;
  }
  return colorCache[senderName];
}

// Group reactions by emoji: { "👍": [{ userId, username }, ...], ... }
function groupReactions(reactions) {
  if (!reactions || reactions.length === 0) return {};
  const groups = {};
  for (const r of reactions) {
    if (!groups[r.emoji]) groups[r.emoji] = [];
    groups[r.emoji].push(r);
  }
  return groups;
}

function MessageBubble({ message, isOwn, onReaction, userId, onEdit, onUnsend, onReply }) {
  const [showReactMenu, setShowReactMenu] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  // Close actions menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setShowActions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (message.type === "system") {
    return (
      <div className="message-bubble system">
        <div className="message-content">{message.content}</div>
      </div>
    );
  }

  // Deleted message
  if (message.isDeleted) {
    return (
      <div className={`message-bubble ${isOwn ? "own" : "other"} deleted-message`}>
        {!isOwn && (
          <div className="message-sender" style={{ color: getUserColor(message.senderName) }}>
            {message.senderName}
          </div>
        )}
        <div className="message-content deleted-content">
          🚫 This message was deleted
        </div>
        <div className="message-time">{formatTime(message.createdAt)}</div>
      </div>
    );
  }

  const userColor = isOwn ? undefined : getUserColor(message.senderName);
  const reactionGroups = groupReactions(message.reactions);
  const hasReactions = Object.keys(reactionGroups).length > 0;

  const handleReact = (emoji) => {
    if (onReaction && message._id) {
      onReaction(message._id, emoji);
    }
    setShowReactMenu(false);
  };

  const handleEdit = () => {
    setShowActions(false);
    if (onEdit) onEdit(message);
  };

  const handleUnsend = () => {
    setShowActions(false);
    if (onUnsend) onUnsend(message);
  };

  const handleReply = () => {
    setShowActions(false);
    setShowReactMenu(false);
    if (onReply) onReply(message);
  };

  return (
    <div
      className={`message-bubble ${isOwn ? "own" : "other"}`}
      style={userColor ? { "--user-color": userColor } : undefined}
      onMouseEnter={() => setShowReactMenu(true)}
      onMouseLeave={() => { setShowReactMenu(false); setShowActions(false); }}
    >
      {/* Reply quote */}
      {message.replyTo?.messageId && (
        <div className="reply-quote">
          <div className="reply-quote-sender">{message.replyTo.senderName}</div>
          <div className="reply-quote-content">{message.replyTo.content}</div>
        </div>
      )}

      {!isOwn && (
        <div className="message-sender" style={{ color: userColor }}>
          {message.senderName}
        </div>
      )}
      <div className="message-content">{message.content}</div>
      <div className="message-meta">
        <span className="message-time">{formatTime(message.createdAt)}</span>
        {message.isEdited && <span className="edited-label">(edited)</span>}
      </div>

      {/* Action buttons (on hover) */}
      {showReactMenu && message._id && (
        <div className={`msg-hover-actions ${isOwn ? "msg-hover-left" : "msg-hover-right"}`}>
          {REACT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="react-menu-btn"
              onClick={() => handleReact(emoji)}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
          <button
            className="react-menu-btn reply-btn"
            onClick={handleReply}
            title="Reply"
          >
            ↩️
          </button>
          {isOwn && (
            <div className="msg-actions-wrapper" ref={actionsRef}>
              <button
                className="react-menu-btn more-btn"
                onClick={() => setShowActions(!showActions)}
                title="More"
              >
                ⋮
              </button>
              {showActions && (
                <div className="msg-actions-dropdown">
                  <button onClick={handleEdit}>✏️ Edit</button>
                  <button onClick={handleUnsend} className="danger-action">🚫 Unsend</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Display existing reactions */}
      {hasReactions && (
        <div className="reactions-row">
          {Object.entries(reactionGroups).map(([emoji, users]) => {
            const iReacted = users.some((u) => u.userId === userId);
            return (
              <button
                key={emoji}
                className={`reaction-chip ${iReacted ? "reaction-mine" : ""}`}
                onClick={() => handleReact(emoji)}
                title={users.map((u) => u.username).join(", ")}
              >
                <span>{emoji}</span>
                <span className="reaction-count">{users.length}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
