import { useNavigate } from "react-router-dom";

function RoomCard({ room }) {
  const navigate = useNavigate();

  return (
    <div
      className="room-card"
      onClick={() => navigate(`/chat/${room._id}`)}
      id={`room-${room._id}`}
    >
      <div className="room-card-header">
        <h3>{room.name}</h3>
        <span className={`room-badge ${room.isPrivate ? "private" : "public"}`}>
          {room.isPrivate ? "Private" : "Public"}
        </span>
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
