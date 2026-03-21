const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    creator: {
      type: String,
      required: [true, "Creator is required"],
    },
    creatorName: {
      type: String,
      required: [true, "Creator name is required"],
    },
    members: [
      {
        userId: String,
        username: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
