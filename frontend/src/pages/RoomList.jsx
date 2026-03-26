import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRooms, deleteRoom as deleteRoomApi } from "../services/api";
import RoomCard from "../components/RoomCard";
import ConfirmModal from "../components/ConfirmModal";

function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
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

  const handleDeleteRoom = (room) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Room",
      message: `Are you sure you want to delete "${room.name}"? All messages will be lost permanently.`,
      confirmText: "Delete Room",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteRoomApi(room._id, { userId: user._id });
          setRooms((prev) => prev.filter((r) => r._id !== room._id));
        } catch (err) {
          setError(err.response?.data?.message || "Failed to delete room.");
        }
        setConfirmModal({ isOpen: false });
      },
    });
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
            <RoomCard
              key={room._id}
              room={room}
              user={user}
              onDeleteRoom={handleDeleteRoom}
            />
          ))}
        </div>
      )}

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

export default RoomList;
