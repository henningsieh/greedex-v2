import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
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
  // Add memory logging here
  setInterval(() => {
    const mem = process.memoryUsage();
    console.log(
      `[${new Date().toISOString()}] RSS: ${Math.round(mem.rss / 1024 / 1024)}MB, Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
    );
  }, 60000);

  const httpServer = createServer(
    (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => {
      if (!request.url) return;

      // Reflecting origin allows cross-origin requests from any host/port
      // while still enabling cookies via Access-Control-Allow-Credentials
      const origin = request.headers.origin;
      if (origin) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Access-Control-Allow-Credentials", "true");
      } else {
        // fallback to wildcard if origin header not provided
        response.setHeader("Access-Control-Allow-Origin", "*");
      }
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS",
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With, X-CSRF-Token",
      );

      // Handle preflight requests early
      if (request.method?.toUpperCase() === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const parsedUrl = parse(request.url, true);
      handle(request, response, parsedUrl);
    },
  );

  // Initialize Socket.IO with optimized settings
  const io = new Server(httpServer, {
    // Accept any origin but reflect it back to allow credentials
    // socket.io accepts `origin: true` to echo the origin in the CORS response
    cors: {
      origin: true,
      credentials: true,
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
