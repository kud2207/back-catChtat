import { Server } from "socket.io"
import http from "http"
import express from "express"


const app = express();
const server = http.createServer(app); //ecoute les req
const BASE_URL = "http://localhost:5173"

// pour connecter au client //
const io = new Server(server, {
    cors: {
        origin: [BASE_URL] //quel conection autoriser
    }
});

//pour receved msg (donne l’adresse en temps réel user)
export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}


const userSocketMap = {} //used to store online users


// pour ecouter qui se connecte au server // 
io.on("connection", (socket) => {

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    //send events to all connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect", () => {


        //suprime le user qui n'est pas connecté
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server };



/**
 * NB
 * 
 * io.emit("getOnlineUsers", Object.keys(userSocketMap))
 * le nom mit dans les "" seront les mm utiliser au niveau du front 
 * socket.on
 * */