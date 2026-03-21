const nodemailer = require("nodemailer");
const config = require("../config/notificationConfig");

// Create transporter
const transporter = nodemailer.createTransport(config.smtp);

// Send welcome email to new user
const sendWelcomeEmail = async (to, username) => {
  try {
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to,
      subject: "Welcome to ChatApp!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6C63FF;">Welcome to ChatApp! 🎉</h1>
          <p>Hi <strong>${username}</strong>,</p>
          <p>Thank you for joining ChatApp! You can now:</p>
          <ul>
            <li>Create and join chat rooms</li>
            <li>Send real-time messages</li>
            <li>Connect with other users</li>
          </ul>
          <p>Start chatting now and enjoy the experience!</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This email was sent from ChatApp.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};

// Send general notification email
const sendNotification = async (to, subject, message) => {
  try {
    const mailOptions = {
      from: `"${config.from.name}" <${config.from.email}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6C63FF;">ChatApp Notification</h2>
          <p>${message}</p>
          <hr style="border: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This email was sent from ChatApp.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Notification email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendNotification,
};
