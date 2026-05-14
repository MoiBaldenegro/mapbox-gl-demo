import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface RemoteLocation {
  userId: string;
  username: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

interface UseLocationSyncOptions {
  username: string;
  serverUrl?: string;
}

export function useLocationSync(options: UseLocationSyncOptions) {
  const { username, serverUrl = 'http://localhost:3001' } = options;
  const socketRef = useRef<Socket | null>(null);
  const [remoteLocations, setRemoteLocations] = useState<Map<string, RemoteLocation>>(
    new Map()
  );
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Conectar al servidor
    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Debug: Conexión establecida
    socket.on('connect', () => {
      console.log('✅ Socket.IO conectado:', socket.id);
      setIsConnected(true);
      // Registrar el usuario cuando se conecta
      socket.emit('user_register', { username });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.IO desconectado');
      setIsConnected(false);
    });

    // Escuchar confirmación de registro
    socket.on('user_registered', (data) => {
      console.log('✓ Usuario registrado:', data);
    });

    // Escuchar cuando otro usuario se conecta
    socket.on('user_joined', (userData) => {
      console.log('👤 Usuario conectado:', userData.username);
      setConnectedUsers((prev) => new Set([...prev, userData.userId]));
    });

    // Escuchar actualizaciones de ubicación
    socket.on('location_updated', (locationData) => {
      console.log('📍 Ubicación recibida de:', locationData.username, locationData);
      setRemoteLocations((prev) => {
        const newMap = new Map(prev);
        newMap.set(locationData.userId, locationData);
        return newMap;
      });
    });

    // Escuchar cuando un usuario se desconecta
    socket.on('user_left', (userData) => {
      console.log('👋 Usuario desconectado:', userData.username);
      setRemoteLocations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userData.userId);
        return newMap;
      });
      setConnectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userData.userId);
        return newSet;
      });
    });

    // Manejar errores
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, [username, serverUrl]);

  // Función para enviar ubicación
  const sendLocation = (latitude: number, longitude: number, accuracy?: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('location_update', {
        latitude,
        longitude,
        accuracy,
      });
    }
  };

  return {
    sendLocation,
    remoteLocations,
    connectedUsers,
    isConnected,
  };
}
