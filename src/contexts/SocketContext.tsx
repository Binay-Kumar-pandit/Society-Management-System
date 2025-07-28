import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same directory

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only attempt to connect if a user is logged in
    if (user) {
      // --- FIX START ---
      // Get the API_BASE_URL from environment variable (same as in AuthContext)
      // This ensures consistency and makes it easy to change IPs.
      const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL; // Assuming backend port 5000
      
      const newSocket = io(SOCKET_SERVER_URL); // Use the correct IP here
      // --- FIX END ---
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id); // Added for debugging
        setIsConnected(true);
        // Only emit join-room if the user object has a role (user is fully loaded)
        if (user.role) {
          newSocket.emit('join-room', user.role);
          console.log(`Socket joined room: ${user.role}`); // Added for debugging
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected'); // Added for debugging
        setIsConnected(false);
      });

      // Added error handling for socket connection
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup function: close socket when component unmounts or user changes to null
      return () => {
        console.log('Closing socket connection...'); // Added for debugging
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('connect_error');
        newSocket.close();
      };
    } else if (socket) {
      // If user logs out, disconnect the socket immediately
      console.log('User logged out, disconnecting socket...');
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]); // Depend on 'user' to re-run effect when user logs in/out

  const value = {
    socket,
    isConnected
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};