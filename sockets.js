const { Server } = require('socket.io');

const createSocketConnection = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Update this with your frontend URL
            methods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'],
            credentials: true,
        }
    });

    io.on("connection", (socket) => {
        console.log("User Connected");
    });

    return io;
};

module.exports = { createSocketConnection };
