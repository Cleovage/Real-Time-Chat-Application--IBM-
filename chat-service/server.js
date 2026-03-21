const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const socketHandler = require("./socket/socketHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/messages", chatRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Chat Service is running", port: process.env.PORT });
});

// Initialize Socket.IO handler
socketHandler(io);

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});
