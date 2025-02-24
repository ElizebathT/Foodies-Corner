const { Server } = require("socket.io");

const users = new Map(); // Store connected users with their socket IDs

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Adjust according to your frontend domain
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        // Handle user registration
        socket.on("register", (userId) => {
            users.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
        });

        // Handle private messaging
        socket.on("privateMessage", ({ senderId, receiverId, message }) => {
            const receiverSocketId = users.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("messageReceived", { senderId, message });
            } else {
                console.log(`User ${receiverId} is not online.`);
            }
        });

        // Handle user disconnect
        socket.on("disconnect", () => {
            for (let [userId, socketId] of users.entries()) {
                if (socketId === socket.id) {
                    users.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });
};

module.exports = initializeSocket;
