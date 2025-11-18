import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = isProduction
  ? "https://catchat-5woz.onrender.com"
  : "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

// Fonction utilitaire exportée
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Gestion des connexions
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} connected (socket: ${socket.id})`);
  }

  // Informe tous les clients des utilisateurs en ligne
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId] === socket.id) {
      delete userSocketMap[userId];
      console.log(`📴 User ${userId} disconnected`);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };

/**
 * NB
 * 
 * io.emit("getOnlineUsers", Object.keys(userSocketMap))
 * le nom mit dans les "" seront les mm utiliser au niveau du front 
 * socket.on
 * */