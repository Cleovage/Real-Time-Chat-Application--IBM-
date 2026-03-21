# Real-Time Chat Application

A full-stack real-time chat application built using **Microservices Architecture** with **Node.js**, **Express**, **MongoDB**, **Socket.IO**, and **React**.

## Architecture

This application is composed of **5 independent microservices** and a **React frontend**, all communicating through an **API Gateway**.

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
│                      Port: 5173                         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    API Gateway                          │
│                    Port: 3000                           │
└──┬──────────┬──────────┬──────────┬─────────────────────┘
   │          │          │          │
   ▼          ▼          ▼          ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌────────────┐
│ User │  │ Chat │  │ Room │  │Notification│
│ Svc  │  │ Svc  │  │ Svc  │  │   Service  │
│ 3001 │  │ 3002 │  │ 3003 │  │    3004    │
└──┬───┘  └──┬───┘  └──┬───┘  └────────────┘
   │         │         │
   ▼         ▼         ▼
┌──────────────────────────┐
│    MongoDB (Port 27017)  │
│  chatapp-users           │
│  chatapp-messages        │
│  chatapp-rooms           │
└──────────────────────────┘
```

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 3000 | Routes all client requests to appropriate microservices |
| **User Service** | 3001 | User registration, login, JWT authentication, profiles |
| **Chat Service** | 3002 | Real-time messaging with Socket.IO, message history |
| **Room Service** | 3003 | Chat room CRUD, join/leave room functionality |
| **Notification Service** | 3004 | Email notifications using Nodemailer |

## Tech Stack

- **Frontend**: React, Vite, Socket.IO Client, Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Real-Time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Email**: Nodemailer
- **Gateway**: http-proxy-middleware
- **Containerization**: Docker, Docker Compose

## Folder Structure

```
chatapp/
├── frontend/                 # React frontend application
├── api-gateway/              # API Gateway service
├── user-service/             # User authentication service
├── chat-service/             # Real-time chat service
├── room-service/             # Room management service
├── notification-service/     # Email notification service
├── docker-compose.yml        # Docker orchestration
└── README.md                 # Project documentation
```

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running on localhost:27017)
- **npm** (Node Package Manager)

## Getting Started

### 1. Install Dependencies

Open separate terminals and install dependencies for each service:

```bash
cd user-service && npm install
cd chat-service && npm install
cd room-service && npm install
cd notification-service && npm install
cd api-gateway && npm install
cd frontend && npm install
```

### 2. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

### 3. Start All Services

Start each service in a separate terminal:

```bash
# Terminal 1 - User Service
cd user-service && npm start

# Terminal 2 - Chat Service
cd chat-service && npm start

# Terminal 3 - Room Service
cd room-service && npm start

# Terminal 4 - Notification Service
cd notification-service && npm start

# Terminal 5 - API Gateway
cd api-gateway && npm start

# Terminal 6 - Frontend
cd frontend && npm run dev
```

### 4. Open the Application

Visit `http://localhost:5173` in your browser.

## Using Docker

```bash
docker-compose up --build
```

## Run Modes (Important for Login/Register)

This project supports three development modes. Most login/register issues happen when mode configuration is mixed incorrectly.

### 1) All-Local (recommended for debugging)
- Start MongoDB on your machine (`localhost:27017`)
- Start all services with npm scripts
- Keep `api-gateway/.env` as:
   - `USER_SERVICE_URL=http://localhost:3001`
   - `CHAT_SERVICE_URL=http://localhost:3002`
   - `ROOM_SERVICE_URL=http://localhost:3003`
   - `NOTIFICATION_SERVICE_URL=http://localhost:3004`

### 2) All-Docker (recommended for environment parity)
- Start everything with Docker Compose
- Service URLs are injected automatically via `docker-compose.yml`:
   - `http://user-service:3001`, `http://chat-service:3002`, etc.
- Do not override these values to `localhost` inside containers.

### 3) Mixed Mode (advanced)
- If `api-gateway` runs locally, target services by `localhost` ports.
- If `api-gateway` runs in Docker, target services by container DNS names.
- If configuration does not match runtime mode, `/api/users/register` and `/api/users/login` may fail with proxy or connection errors.

## API Endpoints

### User Service (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/profile` | Get user profile (auth required) |
| PUT | `/api/users/profile` | Update profile (auth required) |
| GET | `/api/users/:id` | Get user by ID (auth required) |

### Chat Service (`/api/messages`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:roomId` | Get messages for a room |
| POST | `/api/messages` | Send a message |
| DELETE | `/api/messages/:id` | Delete a message |

### Room Service (`/api/rooms`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create a new room |
| GET | `/api/rooms` | Get all public rooms |
| GET | `/api/rooms/:id` | Get room by ID |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| POST | `/api/rooms/:id/join` | Join a room |
| POST | `/api/rooms/:id/leave` | Leave a room |

### Notification Service (`/api/notifications`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/welcome` | Send welcome email |
| POST | `/api/notifications/send` | Send notification email |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinRoom` | Client → Server | Join a chat room |
| `leaveRoom` | Client → Server | Leave a chat room |
| `sendMessage` | Client → Server | Send a message |
| `message` | Server → Client | Receive a message |
| `typing` | Bidirectional | Typing indicator |
| `stopTyping` | Bidirectional | Stop typing indicator |

## Features

- ✅ User Registration & Login with JWT
- ✅ Real-time messaging with Socket.IO
- ✅ Create and join chat rooms
- ✅ Typing indicators
- ✅ Message history with pagination
- ✅ Email notifications
- ✅ Responsive dark-themed UI
- ✅ Microservices architecture
- ✅ API Gateway pattern
- ✅ Docker support
