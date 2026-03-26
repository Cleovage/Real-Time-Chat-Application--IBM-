import { useState } from "react";

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

function MessageBubble({ message, isOwn, onReaction, userId }) {
  const [showReactMenu, setShowReactMenu] = useState(false);

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

  const userColor = isOwn ? undefined : getUserColor(message.senderName);
  const reactionGroups = groupReactions(message.reactions);
  const hasReactions = Object.keys(reactionGroups).length > 0;

  const handleReact = (emoji) => {
    if (onReaction && message._id) {
      onReaction(message._id, emoji);
    }
    setShowReactMenu(false);
  };

  return (
    <div
      className={`message-bubble ${isOwn ? "own" : "other"}`}
      style={userColor ? { "--user-color": userColor } : undefined}
      onMouseEnter={() => setShowReactMenu(true)}
      onMouseLeave={() => setShowReactMenu(false)}
    >
      {!isOwn && (
        <div className="message-sender" style={{ color: userColor }}>
          {message.senderName}
        </div>
      )}
      <div className="message-content">{message.content}</div>
      <div className="message-time">{formatTime(message.createdAt)}</div>

      {/* Reaction bar (on hover) */}
      {showReactMenu && message._id && (
        <div className={`react-menu ${isOwn ? "react-menu-left" : "react-menu-right"}`}>
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
