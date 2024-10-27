const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
