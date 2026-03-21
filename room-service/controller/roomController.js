const Room = require("../models/roomModel");

// @desc    Create a new room
// @route   POST /api/rooms
const createRoom = async (req, res) => {
  try {
    const { name, description, creator, creatorName, isPrivate } = req.body;

    const roomExists = await Room.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: "Room name already exists" });
    }

    const room = await Room.create({
      name,
      description,
      creator,
      creatorName,
      isPrivate: isPrivate || false,
      members: [{ userId: creator, username: creatorName }],
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.name = req.body.name || room.name;
    room.description = req.body.description || room.description;
    room.isPrivate = req.body.isPrivate !== undefined ? req.body.isPrivate : room.isPrivate;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/:id/join
const joinRoom = async (req, res) => {
  try {
    const { userId, username } = req.body;
    if (!userId || !username) {
      return res.status(400).json({ message: "userId and username are required" });
    }

    const updatedRoom = await Room.findOneAndUpdate(
      { _id: req.params.id, "members.userId": { $ne: userId } },
      { $addToSet: { members: { userId, username } } },
      { new: true }
    );

    if (!updatedRoom) {
      const room = await Room.findById(req.params.id);

      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      return res.status(400).json({ message: "Already a member of this room" });
    }

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/:id/leave
const leaveRoom = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: { userId } } },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
};
