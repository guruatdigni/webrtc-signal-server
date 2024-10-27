// const path = require('path');
// const { createServer } = require('http');

// const express = require('express');
// const { getIO, initIO } = require('./socket22');

// const app = express();

// app.use('/', express.static(path.join(__dirname, 'static')));

// const httpServer = createServer(app);

// let port = process.env.PORT || 3500;

// initIO(httpServer);

// httpServer.listen(port)
// console.log("Server started on ", port);

// getIO();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Forward signaling messages to the other peer
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });

  // Handle call hang-up
  socket.on('hangup', () => {
    socket.broadcast.emit('hangup');
  });

  // Handle mute/unmute status
  socket.on('muteStatus', (isMuted) => {
    socket.broadcast.emit('muteStatus', isMuted);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
