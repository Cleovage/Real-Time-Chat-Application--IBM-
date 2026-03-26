import { useNavigate } from "react-router-dom";

function RoomCard({ room, user, onDeleteRoom }) {
  const navigate = useNavigate();

  const isCreator = user && room.creator === user._id;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeleteRoom) {
      onDeleteRoom(room);
    }
  };

  return (
    <div
      className="room-card"
      onClick={() => navigate(`/chat/${room._id}`)}
      id={`room-${room._id}`}
    >
      <div className="room-card-header">
        <h3>{room.name}</h3>
        <div className="room-card-badges">
          <span className={`room-badge ${room.isPrivate ? "private" : "public"}`}>
            {room.isPrivate ? "Private" : "Public"}
          </span>
          {isCreator && (
            <button
              className="room-delete-btn"
              onClick={handleDelete}
              title="Delete room"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <p>{room.description || "No description"}</p>
      <div className="room-card-footer">
        <div className="room-members">
          👥 {room.members?.length || 0} members
        </div>
        <span>Created by {room.creatorName}</span>
      </div>
    </div>
  );
}

export default RoomCard;
