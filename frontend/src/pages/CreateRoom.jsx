import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../services/api";

function CreateRoom({ user }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await createRoom({
        name,
        description,
        creator: user._id,
        creatorName: user.username,
        isPrivate,
      });
      navigate(`/chat/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-room-page">
      <div className="create-room-card">
        <h2>Create a Chat Room</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="room-name">Room Name</label>
            <input
              type="text"
              id="room-name"
              placeholder="Enter room name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="room-description">Description</label>
            <textarea
              id="room-description"
              placeholder="Describe what this room is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="room-private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="room-private">Make this room private</label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="create-room-submit"
          >
            {loading ? "Creating..." : "🚀 Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;
