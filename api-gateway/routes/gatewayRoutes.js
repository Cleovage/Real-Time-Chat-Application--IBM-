const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const gatewayConfig = require("../config/gatewayConfig");

const router = express.Router();

// Proxy to User Service
router.use(
  "/api/users",
  createProxyMiddleware({
    target: `${gatewayConfig.services.users.url}${gatewayConfig.services.users.path}`,
    changeOrigin: true,
  })
);

// Proxy to Chat Service
router.use(
  "/api/messages",
  createProxyMiddleware({
    target: `${gatewayConfig.services.messages.url}${gatewayConfig.services.messages.path}`,
    changeOrigin: true,
  })
);

// Proxy to Room Service
router.use(
  "/api/rooms",
  createProxyMiddleware({
    target: `${gatewayConfig.services.rooms.url}${gatewayConfig.services.rooms.path}`,
    changeOrigin: true,
  })
);

// Proxy to Notification Service
router.use(
  "/api/notifications",
  createProxyMiddleware({
    target: `${gatewayConfig.services.notifications.url}${gatewayConfig.services.notifications.path}`,
    changeOrigin: true,
  })
);

module.exports = router;
