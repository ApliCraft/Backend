import app from "./app";
import "dotenv/config";
import http from "http";
import { SocketIO } from "./socket.io";

const server = http.createServer(app);

SocketIO(server);

const PORT: Number = Number(process.env.PORT) || 4000;

server.listen(PORT, (): void => {
  console.log(`Server running on PORT: ${PORT}`);
});
