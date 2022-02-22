import { Redis } from "ioredis";
import { Server, Socket } from "socket.io";

const stopChat = async (io: Server, socket: Socket, redis: Redis) => {
  const roomId = await redis.get(socket.id);
  if (roomId) {
    io.to(roomId).emit("stopChat");
    const sockets = await io.in(roomId).fetchSockets();
    sockets.map(async (s) => {
      await redis.del(s.id);
    });
  }
};

export default stopChat;
