import axios from "axios";

// Use the same host the page was loaded from so the app works
// both locally (localhost) and from other devices on the same WiFi.
const API_URL = `http://${window.location.hostname}:3000`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("chatUser"));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth API
export const registerUser = (userData) => api.post("/api/users/register", userData);
export const loginUser = (userData) => api.post("/api/users/login", userData);
export const getUserProfile = () => api.get("/api/users/profile");
export const updateUserProfile = (userData) => api.put("/api/users/profile", userData);
export const getUserById = (id) => api.get(`/api/users/${id}`);
export const getAllUsers = () => api.get("/api/users");

// Room API
export const createRoom = (roomData) => api.post("/api/rooms", roomData);
export const getRooms = () => api.get("/api/rooms");
export const getRoomById = (id) => api.get(`/api/rooms/${id}`);
export const updateRoom = (id, roomData) => api.put(`/api/rooms/${id}`, roomData);
export const deleteRoom = (id) => api.delete(`/api/rooms/${id}`);
export const joinRoom = (id, userData) => api.post(`/api/rooms/${id}/join`, userData);
export const leaveRoom = (id, userData) => api.post(`/api/rooms/${id}/leave`, userData);

// Message API
export const getMessages = (roomId, page = 1) => api.get(`/api/messages/${roomId}?page=${page}`);
export const sendMessage = (messageData) => api.post("/api/messages", messageData);
export const deleteMessage = (id) => api.delete(`/api/messages/${id}`);

// Notification API
export const sendWelcomeEmail = (data) => api.post("/api/notifications/welcome", data);
export const sendNotification = (data) => api.post("/api/notifications/send", data);

export default api;
