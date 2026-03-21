const gatewayConfig = {
  services: {
    users: {
      url: process.env.USER_SERVICE_URL || "http://localhost:3001",
      path: "/api/users",
    },
    messages: {
      url: process.env.CHAT_SERVICE_URL || "http://localhost:3002",
      path: "/api/messages",
    },
    rooms: {
      url: process.env.ROOM_SERVICE_URL || "http://localhost:3003",
      path: "/api/rooms",
    },
    notifications: {
      url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
      path: "/api/notifications",
    },
  },
  socketService: {
    url: process.env.CHAT_SERVICE_URL || "http://localhost:3002",
  },
};

module.exports = gatewayConfig;
