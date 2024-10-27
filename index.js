const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Store connected users

// Serve static files from the public directory
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (username) => {
        users[socket.id] = username; // Associate the socket with a username
        socket.broadcast.emit('user joined', username); // Notify other users
        console.log(`${username} joined the call.`);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            delete users[socket.id]; // Remove user from the list
            socket.broadcast.emit('user left', username); // Notify other users
            console.log(`${username} left the call.`);
        }
    });

    // Handle call user event
    socket.on('call user', ({ to }) => {
        socket.broadcast.to(to).emit('incoming call', { from: users[socket.id] });
    });

    // Handle answer call event
    socket.on('answer call', ({ from }) => {
        socket.broadcast.to(from).emit('call accepted', { to: users[socket.id] });
    });

    // Handle offer event
    socket.on('offer', ({ to, offer }) => {
        socket.broadcast.to(to).emit('offer', { from: users[socket.id], offer });
    });

    // Handle answer event
    socket.on('answer', ({ to, answer }) => {
        socket.broadcast.to(to).emit('answer', { from: users[socket.id], answer });
    });

    // Handle ICE candidate event
    socket.on('ice-candidate', ({ to, candidate }) => {
        socket.broadcast.to(to).emit('ice-candidate', { from: users[socket.id], candidate });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
