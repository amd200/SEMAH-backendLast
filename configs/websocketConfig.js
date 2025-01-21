import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    pingTimeout: 60000,
    pingInterval: 25000,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('send-message', (data) => {
      const { chatId, content, sender, createdAt } = data;
      console.log('send-message', data);
      io.to(chatId).emit('receive-message', content);
    });

    socket.on('join-room', (chatId) => {
      console.log('join-room', chatId);
      socket.join(chatId);
      console.log(`User ${socket.id} joined room: ${chatId}`);
    });

    socket.on('receive-message', (data) => {
      const { content } = data;
      console.log('receive-message', content);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  return io;
};

export const notifyEmployee = (employeeId, message) => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  io.to(employeeId).emit('notification', message);
};

// Function to notify a client
export const notifyClient = (clientId, message) => {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  io.to(clientId).emit('notification', message);
};
