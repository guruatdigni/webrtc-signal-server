const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Store connected users

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', ({ username, room }) => {
        users[socket.id] = { username, room }; // Store user with their room
        socket.join(room); // Join the user to the specified room
        socket.to(room).emit('user joined', username); // Notify others in the room
        console.log(`${username} joined room ${room}.`);
    });

    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user) {
            socket.to(user.room).emit('user left', user.username);
            delete users[socket.id]; // Remove user from list
        }
        console.log('A user disconnected:', socket.id);
    });

    socket.on('start call', ({ room }) => {
        socket.to(room).emit('incoming call', { from: users[socket.id].username, room });
    });

    socket.on('answer call', ({ from, room }) => {
        socket.to(room).emit('call accepted', { to: users[socket.id].username, room });
    });

    socket.on('offer', ({ to, offer, room }) => {
        socket.to(room).emit('offer', { from: users[socket.id].username, offer });
    });

    socket.on('answer', ({ to, answer, room }) => {
        socket.to(room).emit('answer', { from: users[socket.id].username, answer });
    });

    socket.on('ice-candidate', ({ to, candidate, room }) => {
        socket.to(room).emit('ice-candidate', { candidate });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
