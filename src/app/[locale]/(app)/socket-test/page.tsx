"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

interface Message {
  text: string;
  timestamp: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io();

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    // Listen for messages
    socketInstance.on("message", (data: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: "message",
        },
      ]);
    });

    // Listen for pings
    socketInstance.on("ping", (data: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: "ping",
        },
      ]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (socket && inputMessage.trim()) {
      socket.emit("client-message", {
        text: inputMessage,
        timestamp: new Date().toISOString(),
      });
      setInputMessage("");
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-sans sm:p-20">
      <main className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-4xl">Socket.IO + Next.js</h1>

        {/* Connection Status */}
        <div className="mb-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="font-medium">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!isConnected || !inputMessage.trim()}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {/* Messages Display */}
        <div className="h-96 overflow-y-auto rounded-lg border border-gray-300 p-4 dark:border-gray-700">
          <h2 className="mb-4 font-semibold text-xl">Messages</h2>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet...</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.timestamp}
                  className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800"
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="mt-1 text-gray-500 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <p className="text-gray-600 text-sm dark:text-gray-400">
            Total messages received:{" "}
            <span className="font-bold">{messages.length}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
