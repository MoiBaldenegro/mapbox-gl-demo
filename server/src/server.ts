import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration for Socket.IO
const corsOrigin = process.env.FRONTEND_URL || 'https://mapbox-gl-demo.vercel.app';
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow multiple origins
      const allowedOrigins = [
        'https://mapbox-gl-demo.vercel.app',
        'https://mapbox-gl-demo.vercel.app/',
        corsOrigin,
        corsOrigin + '/',
        'http://localhost:5173',
        'http://localhost:3000',
      ];
      
      if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.replace(/\/$/, '')))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas HTTP
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Health check para Prisma
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: String(error) });
  }
});

// Obtener ubicaciones recientes de todos los usuarios
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { user: true },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching locations' });
  }
});

// Obtener ubicación actual de un usuario
app.get('/api/users/:userId/location', async (req, res) => {
  try {
    const location = await prisma.location.findFirst({
      where: { userId: req.params.userId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching location' });
  }
});

// WebSocket events
io.on('connection', (socket) => {
  console.log(`📍 Usuario conectado: ${socket.id}`);

  // Cuando un usuario se registra
  socket.on('user_register', async (userData) => {
    try {
      console.log(`Attempting to register user: ${userData.username}`);
      
      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: { username: userData.username },
      });
      
      socket.data.userId = user.id;
      socket.data.username = user.username;
      
      // Notificar que un nuevo usuario se conectó
      io.emit('user_joined', {
        userId: user.id,
        username: user.username,
      });
      
      console.log(`✓ Usuario registrado: ${user.username}`);
      socket.emit('user_registered', { success: true, userId: user.id });
    } catch (error) {
      console.error('Error registering user:', error);
      socket.emit('error', `Error registering user: ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  // Cuando se recibe una actualización de ubicación
  socket.on('location_update', async (locationData) => {
    if (!socket.data.userId) {
      socket.emit('error', 'User not registered');
      return;
    }

    try {
      const location = await prisma.location.create({
        data: {
          userId: socket.data.userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
        },
        include: { user: true },
      });

      // Emitir la ubicación a todos los clientes conectados
      io.emit('location_updated', {
        id: location.id,
        userId: location.userId,
        username: socket.data.username,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      });

      console.log(`📍 Ubicación actualizada: ${socket.data.username} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
    } catch (error) {
      console.error('Error updating location:', error);
      socket.emit('error', 'Error updating location');
    }
  });

  // Cuando se desconecta
  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
    if (socket.data.userId) {
      io.emit('user_left', {
        userId: socket.data.userId,
        username: socket.data.username,
      });
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de errores
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
