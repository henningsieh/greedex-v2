import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (!req.url) return;
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send a welcome message
    socket.emit("message", {
      text: "Welcome to Socket.IO!",
      timestamp: new Date().toISOString(),
    });

    // Handle client messages
    socket.on("client-message", (data) => {
      console.log("Received from client:", data);
      socket.emit("message", {
        text: `Server received: "${data.text}"`,
        timestamp: new Date().toISOString(),
      });
    });

    // Send ping every 10 seconds
    const pingInterval = setInterval(() => {
      socket.emit("ping", {
        text: `Ping from server at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toISOString(),
      });
    }, 10000);

    // Cleanup on disconnect
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      clearInterval(pingInterval);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`,
      );
    });
});
