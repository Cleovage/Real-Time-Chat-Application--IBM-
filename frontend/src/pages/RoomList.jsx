import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRooms } from "../services/api";
import RoomCard from "../components/RoomCard";

function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchRooms();
  }, [user, navigate]);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data);
    } catch (err) {
      setError("Failed to load rooms. Make sure the services are running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rooms-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Chat Rooms</h1>
        <Link to="/create-room" className="btn btn-primary">
          ✨ Create Room
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {rooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>No rooms yet</h3>
          <p>Create the first chat room and start chatting!</p>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}

export default RoomList;
