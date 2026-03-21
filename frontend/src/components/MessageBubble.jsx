function MessageBubble({ message, isOwn }) {
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

  return (
    <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
      {!isOwn && <div className="message-sender">{message.senderName}</div>}
      <div className="message-content">{message.content}</div>
      <div className="message-time">{formatTime(message.createdAt)}</div>
    </div>
  );
}

export default MessageBubble;
