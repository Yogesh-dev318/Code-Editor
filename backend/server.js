const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB();

// Middleware
app.use(cors({
     origin: 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/run', require('./routes/runRoutes')); 
// Socket.io
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});
const getRoomCount = (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
};
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong on the server!';
  
    res.status(statusCode).json({
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });
  
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  
    // Catch-all handler: send back React's index.html file for any non-API routes
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
      } else {
        next();
      }
    });
  }
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join-project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project: ${projectId}`);

        // Calculate count AFTER joining
        const count = getRoomCount(projectId);
        
        // Broadcast new count to EVERYONE in the room (including sender)
        io.to(projectId).emit('user-count', count);
    });

    socket.on('code-change', ({ projectId, fileId, content }) => {
        socket.to(projectId).emit('code-update', { fileId, content });
    });
    socket.on('project-structure-updated', ({ projectId }) => {
        socket.to(projectId).emit('refresh-files');
    });
    socket.on('disconnecting', () => {
        // 'disconnecting' fires BEFORE the socket leaves the rooms.
        // We iterate through all rooms this socket is part of.
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                // Get current count
                const currentCount = getRoomCount(room);
                // The user is about to leave, so new count is current - 1
                const newCount = Math.max(0, currentCount - 1);
                
                // Notify remaining users in that room
                socket.to(room).emit('user-count', newCount);
                console.log(`User leaving room ${room}. New count: ${newCount}`);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));