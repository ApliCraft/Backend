import { Server, IncomingMessage, ServerResponse } from "http";
import io from "socket.io";
import { streamChatWithOllama } from "./services/ollama.service";

const SocketIO = (
  server: Server<typeof IncomingMessage, typeof ServerResponse>
) => {
  const ioServer = new io.Server(server, {
    cors: {
      credentials: true,
    },
  });

  ioServer.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("ask", async ({ message }: { message: string }) => {
      console.log(message);

      const response = streamChatWithOllama(message);

      for await (const part of response) {
        socket.emit("response", part);
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  return ioServer;
};

export { SocketIO };
