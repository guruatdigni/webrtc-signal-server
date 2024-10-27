const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('join', (username) => {
        socket.username = username;
        socket.broadcast.emit('user joined', username);
    });

    socket.on('call user', (data) => {
        socket.to(data.to).emit('incoming call', { from: socket.username });
    });

    socket.on('answer call', (data) => {
        socket.to(data.from).emit('call accepted', { to: socket.username });
    });

    socket.on('reject call', (data) => {
        socket.to(data.from).emit('call rejected', { to: socket.username });
    });

    socket.on('offer', (data) => {
        socket.to(data.to).emit('offer', { from: socket.username, offer: data.offer });
    });

    socket.on('answer', (data) => {
        socket.to(data.to).emit('answer', { from: socket.username, answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.to).emit('ice-candidate', { from: socket.username, candidate: data.candidate });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
