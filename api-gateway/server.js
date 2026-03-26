const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const gatewayRoutes = require("./routes/gatewayRoutes");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());

// Gateway routes (proxy all API requests)
app.use("/", gatewayRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "API Gateway is running",
    port: process.env.PORT,
    services: {
      users: process.env.USER_SERVICE_URL,
      chat: process.env.CHAT_SERVICE_URL,
      rooms: process.env.ROOM_SERVICE_URL,
      notifications: process.env.NOTIFICATION_SERVICE_URL,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API Gateway running on port ${PORT} (all interfaces)`);
});
