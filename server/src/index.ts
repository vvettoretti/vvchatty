import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { __port__ } from "./constants";
import Redis from "ioredis";
import { randomUUID } from "crypto";
import stopChat from "./utils/stopChat";

const app = express();

// app.use(cors());

const httpServer = createServer(app);

const redis = new Redis();

// app.use("/peerjs", peerServer);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", async (socket) => {
  console.log(socket.id, "connected");
  await redis.sadd("allUsers", socket.id);

  socket.on("disconnect", async () => {
    console.log(socket.id, "disconnected");
    stopChat(io, socket, redis);
    await redis.srem("allUsers", socket.id);
    await redis.srem("searchingUsers", socket.id);
  });

  socket.on("startSearch", async () => {
    await redis.sadd("searchingUsers", socket.id); // Cannot add duplicate values because it's a SET
  });
  socket.on("stopSearch", async () => {
    await redis.srem("searchingUsers", socket.id);
  });

  socket.on("chatMessage", async (message) => {
    const roomId = await redis.get(socket.id);
    if (roomId) {
      io.to(roomId).emit("chatMessage", { message, user: socket.id });
    }
  });
  socket.on("typing", async () => {
    const roomId = await redis.get(socket.id);
    if (roomId) {
      io.to(roomId).emit("typing", { user: socket.id });
    }
  });
  socket.on("stopChat", async () => {
    stopChat(io, socket, redis);
  });
});

setInterval(async () => {
  const userCount = await redis.scard("allUsers");
  io.emit("userCount", userCount);

  const searchingUsers = await redis.srandmember("searchingUsers", 2);
  if (searchingUsers.length === 2) {
    const roomId = randomUUID();
    searchingUsers.map(async (socketId) => {
      io.sockets.sockets.get(socketId)?.join(roomId);
      await redis.set(socketId, roomId);
    });

    io.to(roomId).emit("startChat", {
      caller: searchingUsers[0],
      accepter: searchingUsers[1],
    });
    // await redis.set(searchingUsers[0] + "-" + searchingUsers[1], roomId);
    searchingUsers.map(async (socketId) => {
      await redis.srem("searchingUsers", socketId);
    });
  }
}, 2000);

httpServer.listen(__port__, async () => {
  console.log("App running on port", __port__);
  await redis.flushall();
});