const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

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
app.use("/api/rooms", roomRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Room Service is running", port: process.env.PORT });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Room Service running on port ${PORT}`);
});
