import { Server } from "socket.io";

let io; // Declare `io` globally to be accessible across the module

export const initializeWebSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all origins (you can restrict this to specific origins in production)
      methods: ["GET", "POST"], // Allowed methods
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle message sending
    socket.on("send-message", (data) => {
      const { chatId, content, sender,createdAt } = data;
      console.log("send-message", data);
      // Emit the received message to all clients in the specific chat room
      io.to(chatId).emit("receive-message", content);
    });

    // Handle room joining
    socket.on("join-room", (chatId) => {
      console.log("join-room", chatId);
      socket.join(chatId);
      console.log(`User ${socket.id} joined room: ${chatId}`);
    });

    socket.on("receive-message", (data) => {
      const { content } = data;
      console.log("receive-message", content);
      // Update the chat UI with the new message
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });

  return io; // Return the initialized WebSocket server
};

// Function to notify an employee
export const notifyEmployee = (employeeId, message) => {
  if (!io) {
    throw new Error("WebSocket server not initialized");
  }
  io.to(employeeId).emit("notification", message); // Notify the employee
};

// Function to notify a client
export const notifyClient = (clientId, message) => {
  if (!io) {
    throw new Error("WebSocket server not initialized");
  }
  io.to(clientId).emit("notification", message); // Notify the client
};
