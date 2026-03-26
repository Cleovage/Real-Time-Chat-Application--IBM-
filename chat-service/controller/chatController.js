const Message = require("../models/messageModel");

// @desc    Get messages for a room
// @route   GET /api/messages/:roomId
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ room: roomId });

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  try {
    const { sender, senderName, room, content, type, replyTo } = req.body;

    const message = await Message.create({
      sender,
      senderName,
      room,
      content,
      type: type || "text",
      replyTo: replyTo || {},
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a message (sender only)
// @route   PUT /api/messages/:id
const editMessage = async (req, res) => {
  try {
    const { sender, content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender !== sender) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    if (message.isDeleted) {
      return res.status(400).json({ message: "Cannot edit a deleted message" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unsend a message (sender only, soft-delete)
// @route   PATCH /api/messages/:id/unsend
const unsendMessage = async (req, res) => {
  try {
    const { sender } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender !== sender) {
      return res.status(403).json({ message: "You can only unsend your own messages" });
    }

    message.isDeleted = true;
    message.content = "";
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all messages in a room
// @route   DELETE /api/messages/room/:roomId
const clearChat = async (req, res) => {
  try {
    const { roomId } = req.params;
    await Message.deleteMany({ room: roomId });
    res.json({ message: "All messages cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    await message.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  unsendMessage,
  clearChat,
  deleteMessage,
};
