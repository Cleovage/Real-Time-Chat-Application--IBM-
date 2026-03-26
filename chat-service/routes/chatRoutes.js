const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  editMessage,
  unsendMessage,
  clearChat,
  deleteMessage,
} = require("../controller/chatController");

router.get("/:roomId", getMessages);
router.post("/", sendMessage);
router.put("/:id", editMessage);
router.patch("/:id/unsend", unsendMessage);
router.delete("/room/:roomId", clearChat);
router.delete("/:id", deleteMessage);

module.exports = router;
