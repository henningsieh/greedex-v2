import SocketClient from "@/components/socket/socket-client";
import { env } from "@/env";

/**
 * Server-side page for the Socket test — computes the socket URL using validated
 * environment variables and passes the URL to a client-only component.
 */
export default function Home() {
  const baseUrl = new URL(env.NEXT_PUBLIC_BASE_URL);
  // Explicitly set port for the Socket.IO server from typed env (no hardcoded fallbacks)
  baseUrl.port = String(env.SOCKET_PORT);
  const socketUrl = baseUrl.toString();

  return <SocketClient socketUrl={socketUrl} />;
}
