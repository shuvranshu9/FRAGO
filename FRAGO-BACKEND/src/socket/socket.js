import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userID = socket.user.userID;
    const role = socket.user.role;

    console.log(
      `User connected: ${userID} (Role: ${role}, Socket ID: ${socket.id})`,
    );

    socket.join(`user_${userID}`);
    console.log(`User ${userID} joined room: user_${userID}`);
    if (role) {
      socket.join(`role_${role}`);
      console.log(`User ${userID} joined role room: role_${role}`);
    }

    socket.on("joinRoom", (roomName) => {
      socket.join(roomName);
      console.log(`User ${userID} joined custom room: ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
