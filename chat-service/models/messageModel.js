const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: [true, "Sender is required"],
    },
    senderName: {
      type: String,
      required: [true, "Sender name is required"],
    },
    room: {
      type: String,
      required: [true, "Room is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "system"],
      default: "text",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      messageId: { type: String, default: null },
      senderName: { type: String, default: null },
      content: { type: String, default: null },
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: String, required: true },
        username: { type: String, required: true },
      },
    ],
    readBy: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
