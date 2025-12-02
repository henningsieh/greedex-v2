import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { Server } from "socket.io";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const app = next({
  dev,
  hostname,
  port,
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (!req.url) return;
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with optimized settings
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    // Use built-in heartbeat instead of custom intervals
    pingInterval: 10000, // Send ping every 10s
    pingTimeout: 5000, // Wait 5s for pong before considering connection dead
    connectTimeout: 45000, // Disconnect inactive clients to free resources
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

    // Cleanup on disconnect
    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
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
