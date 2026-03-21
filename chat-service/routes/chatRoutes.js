const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controller/chatController");

router.get("/:roomId", getMessages);
router.post("/", sendMessage);
router.delete("/:id", deleteMessage);

module.exports = router;
