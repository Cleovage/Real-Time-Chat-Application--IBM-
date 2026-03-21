const express = require("express");
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
} = require("../controller/roomController");

router.post("/", createRoom);
router.get("/", getRooms);
router.get("/:id", getRoomById);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);
router.post("/:id/join", joinRoom);
router.post("/:id/leave", leaveRoom);

module.exports = router;
