const notificationConfig = {
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  from: {
    email: process.env.FROM_EMAIL || "noreply@chatapp.com",
    name: process.env.FROM_NAME || "ChatApp",
  },
};

module.exports = notificationConfig;
