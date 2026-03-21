const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sendWelcomeEmail, sendNotification } = require("./services/emailService");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// @desc    Send welcome email
// @route   POST /api/notifications/welcome
app.post("/api/notifications/welcome", async (req, res) => {
  try {
    const { email, username } = req.body;
    const result = await sendWelcomeEmail(email, username);

    if (result.success) {
      res.json({ message: "Welcome email sent successfully", messageId: result.messageId });
    } else {
      res.status(500).json({ message: "Failed to send email", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Send notification email
// @route   POST /api/notifications/send
app.post("/api/notifications/send", async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const result = await sendNotification(email, subject, message);

    if (result.success) {
      res.json({ message: "Notification sent successfully", messageId: result.messageId });
    } else {
      res.status(500).json({ message: "Failed to send notification", error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Notification Service is running", port: process.env.PORT });
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});
