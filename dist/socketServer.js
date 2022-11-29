"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = __importDefault(require("socket.io"));
const cors_1 = __importDefault(require("cors"));
const app_1 = require("firebase/app");
const firebaseConfig = {
    apiKey: "AIzaSyDW3ueN0RwGRzV37-gvB4kLEpvRo6W3AMw",
    authDomain: "clone-socket-api.firebaseapp.com",
    projectId: "gmail-clone-socket-api",
    storageBucket: "gmail-clone-socket-api.appspot.com",
    messagingSenderId: "334212973488",
    appId: "1:334212973488:web:cc3ff49a8aa8d8d6f94c75",
};
(0, app_1.initializeApp)(firebaseConfig);
const origin = process.env.NODE_ENV == "production"
    ? "https://gmail_clone_1f12.vercel.app"
    : "http://localhost:3000";
// Server
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.default.Server(server, {
    cors: {
        origin,
    },
});
app.use((0, cors_1.default)({ origin }));
server.listen(8900, () => console.log("socketIO server started!"));
// Socket.io
let users = [];
const addUser = (userId, socketId) => {
    // Adding user if it doesn't already exist
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
    console.log(`User[${socket.id}] connected!`);
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });
    socket.on("sendMail", (data) => {
        const reciever = getUser(data.reciever._id);
        io.to(reciever === null || reciever === void 0 ? void 0 : reciever.socketId).emit("recieveMail", {
            mail: data.mail,
        });
    });
    socket.on("disconnect", () => {
        console.log(`User[${socket.id}] disconnected!`);
        removeUser(socket.id);
    });
});
