import { ManagerOptions, SocketOptions } from "socket.io-client";

export const socketConfig: Partial<ManagerOptions & SocketOptions> = {
  host:
    process.env.NODE_ENV === "production"
      ? "api-vvchatty.vvettoretti.dev"
      : "localhost:4000",
};
