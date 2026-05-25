import express from 'express'
import cors from 'cors'
import  'dotenv/config'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messsageRoute.js'

import { Server } from 'socket.io'


const PORT = process.env.PORT || 5000
// creating the server
const app = express()
const server = http.createServer(app)


// Initialize socket.io server
export const io = new Server(server,{
    cors:{
        origin:"*"
    }
})

// store online user
export const userSocketMap = {}; // {userid : socketId}


// socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("user connected", userId);

    if(userId) {
        userSocketMap[userId]=socket.id;
    }

    // emit  online user to all connected clients

    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log(`user Disconnected ${userId}`);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})



// Middleware Setup

app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({limit:"50mb", extended:true}))
app.use(cors());



// Route setup
app.use("/api/status",(req,res)=>{
    res.send(`server is live`)
})
app.use("/api/auth",userRouter)
app.use("/api/messages",messageRouter)


await connectDB();

server.listen(PORT,()=>{
    console.log(`server is running @ http://localhost:${PORT}`)
})
