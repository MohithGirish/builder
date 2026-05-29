/*
 * SocketContext.jsx — Global Socket.io connection context.
 *
 * Lazily imports socket.io-client and establishes a persistent connection to
 * the backend when a JWT access token is provided. Exposes the socket instance
 * and connection status via React Context. The connection uses WebSocket with
 * polling fallback, automatic reconnection, and JWT handshake auth. The
 * useSocket() hook provides access to this context from any component.
 */
import { createContext, useContext, useEffect, useRef, useState } from 'react';

const SocketContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function SocketProvider({ token, children }) {
  const socketRef  = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    let socket;

    // Lazy-import so the app still works if socket.io-client is not installed
    import('socket.io-client')
      .then(({ io }) => {
        socket = io(BACKEND_URL, {
          auth:          { token },
          transports:    ['websocket', 'polling'],
          reconnection:  true,
          reconnectionAttempts: 5,
          reconnectionDelay:    2000,
        });

        socket.on('connect',    () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        socketRef.current = socket;
      })
      .catch(() => {
        // socket.io-client not installed — UI still works with mock data
      });

    return () => {
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
