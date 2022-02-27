import cors from "cors";
import { randomUUID } from "crypto";
import express from "express";
import { createServer } from "http";
import Redis from "ioredis";
import { Server } from "socket.io";
import { __port__ } from "./utils/constants";
import stopChat from "./utils/stopChat";

console.log(process.env.CORS_ORIGIN, process.env.REDIS_URl); // Debug

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

const httpServer = createServer(app);

const redis = new Redis(process.env.REDIS_URL || "");

// app.use("/peerjs", peerServer);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
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

  socket.on("chatMessage", async (text: string) => {
    if (text.length < 200) {
      const roomId = await redis.get(socket.id);
      if (roomId) {
        const sockets = await io.in(roomId).fetchSockets();
        sockets.map((s) => {
          if (s.id != socket.id) {
            s.emit("chatMessage", text);
          }
        });
        // io.to(roomId).emit("chatMessage", { message, user: socket.id });
      }
    }
  });

  // I don't want to add typing
  // socket.on("typing", async () => {
  //   const roomId = await redis.get(socket.id);
  //   if (roomId) {
  //     io.to(roomId).emit("typing", { user: socket.id });
  //   }
  // });
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
