import { createContext, use, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { storage } from '@/lib/storage';
import { API_ORIGIN, TOKEN_KEY } from '@/services/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

/** One authenticated real-time connection per session, shared by chat and notifications. */
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const connection = io(API_ORIGIN, { auth: { token: storage.get(TOKEN_KEY, null) } });
    setSocket(connection);
    return () => {
      connection.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return <SocketContext value={socket}>{children}</SocketContext>;
}

/** The live socket, or null while signed out / connecting. */
export function useSocket() {
  return use(SocketContext);
}

/** Subscribes to a socket event for the lifetime of the component. */
export function useSocketEvent(event, handler) {
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);
}
