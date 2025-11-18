import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";


import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 3000;



// Middleware 
app.use(express.json({ limit: "10mb" })); // autorise jusqu’à 10 Mo
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser())
app.use(cors({
  origin: "http://localhost:5173", //pour acepter juste les req httpp de cette 
  credentials: true,
}))

// Route 
//app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.get("/", (req, res) => {
  res.send("Hello World! test is fin");
})

 

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  connectDB();

});
