const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const maxRetries = Number(process.env.DB_MAX_RETRIES || 10);
  const retryDelayMs = Number(process.env.DB_RETRY_DELAY_MS || 3000);

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      console.error(
        `[user-service] MongoDB connection failed (attempt ${attempt}/${maxRetries}): ${error.message}`
      );

      if (isLastAttempt) {
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

module.exports = connectDB;
