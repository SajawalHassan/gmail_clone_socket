import express, { Application } from "express";
import http, { createServer } from "http";
import socketIO from "socket.io";
import cors from "cors";

const origin: string =
  process.env.NODE_ENV == "production"
    ? "https://gmail_clone_1f12.vercel.app"
    : "http://localhost:3000";

// Server
const app: Application = express();
const server: http.Server = createServer(app);
const io: socketIO.Server = new socketIO.Server(server, {
  cors: {
    origin,
    credentials: true,
    optionsSuccessStatus: 200,
  },
});

const corsOptions = {
  origin,
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

server.listen(8900, () => console.log("socketIO server started!"));

// Socket.io
let users: object[] = [];

const addUser = (userId: string, socketId: string) => {
  // Adding user if it doesn't already exist
  !users.some((user: any) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId: string) => {
  users = users.filter((user: any) => user.socketId !== socketId);
};

const getUser = (userId: string) => {
  return users.find((user: any) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log(`User[${socket.id}] connected!`);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMail", (data) => {
    const reciever: any = getUser(data.reciever._id);
    io.to(reciever?.socketId).emit("recieveMail", {
      mail: data.mail,
    });
  });

  socket.on("disconnect", () => {
    console.log(`User[${socket.id}] disconnected!`);
    removeUser(socket.id);
  });
});
