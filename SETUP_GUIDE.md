# 📍 Sistema de Rastreo en Tiempo Real - Resumen

## ¿Qué se creó?

### 🎨 Frontend Updates
- **Hook nuevo**: `src/hooks/useLocationSync.ts` - Maneja la conexión WebSocket con el servidor
- **Actualizado**: `src/hooks/useTracking.tsx` - Ahora integra Socket.IO y muestra marcadores de otros usuarios
- **Agregado**: `socket.io-client` a dependencias

### 🚀 Backend (Nuevo)
```
server/
├── src/
│   └── server.ts          # Servidor Express + Socket.IO
├── prisma/
│   └── schema.prisma      # Modelo de datos (User, Location)
├── .env                   # Variables de entorno
├── package.json
└── tsconfig.json
```

### 📦 Base de Datos
- **SQLite** (ligera, sin configuración externa)
- **Prisma ORM** (fácil de usar)
- **Modelos**: 
  - `User`: username único
  - `Location`: lat, lng, accuracy, timestamp

## 🚀 Cómo Empezar

### Opción 1: Setup Automático (Windows)
```bash
setup.bat
```

### Opción 2: Setup Manual

**1. Instalar dependencias del backend**
```bash
cd server
pnpm install
```

**2. Crear base de datos**
```bash
npx prisma migrate dev --name init
```

**3. En dos terminales:**

Terminal 1 (Frontend):
```bash
pnpm dev
```

Terminal 2 (Backend):
```bash
cd server
pnpm dev
```

## 🔄 Cómo Funciona

```
Usuario A (Browser 1)                Usuario B (Browser 2)
      │                                    │
      ├─ Geolocation API                   ├─ Geolocation API
      │  (obtiene ubicación)               │  (obtiene ubicación)
      │                                    │
      ├─ Socket.IO                         ├─ Socket.IO
      │  (envía al servidor)               │  (envía al servidor)
      │                                    │
      └────────────────────┬───────────────┘
                           │
                    Servidor Node.js
                    (Socket.IO Hub)
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
    Prisma DB                         Emite a ambos clientes
    (guarda ubicaciones)             (broadcasting)
        │                                      │
        └──────────────────┬──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
   Browser 1                             Browser 2
   Mapbox Map                            Mapbox Map
   - Tu marcador (rojo)                  - Tu marcador (rojo)
   - Otros usuarios (verde)              - Otros usuarios (verde)
```

## 🎯 Features Implementados

✅ **Real-time tracking**
- WebSockets (Socket.IO)
- Actualizaciones en vivo sin delay

✅ **Multi-usuario**
- Cada usuario ve su ubicación
- Cada usuario ve las de otros
- Marcadores de colores diferentes

✅ **Persistencia**
- Se guarda historial de ubicaciones
- Puedes recuperar datos después

✅ **Info detallada**
- Latitude/Longitude
- Accuracy (precisión GPS)
- Username
- Timestamp

## 🔧 Configuración

### Frontend Variables (`.env`)
```env
VITE_MAPBOX_TOKEN=pk.your_token
VITE_SERVER_URL=http://localhost:3001
```

### Backend Variables (`server/.env`)
```env
DATABASE_URL="file:./dev.db"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## 📊 API Endpoints

### REST API
- `GET /api/health` - Health check
- `GET /api/locations` - Últimas 100 ubicaciones
- `GET /api/users/:userId/location` - Ubicación actual de usuario

### WebSocket Events

**Enviar al servidor:**
```javascript
emit('user_register', { username: 'nombre' })
emit('location_update', { latitude, longitude, accuracy })
```

**Recibir del servidor:**
```javascript
on('user_joined', userData)
on('location_updated', locationData)
on('user_left', userData)
on('error', errorMessage)
```

## 🎨 Personalizaciones

En `src/hooks/useTracking.tsx`:

```typescript
// Cambiar color del marcador propio
marker.current = new mapboxgl.Marker({ color: '#FF6B6B' })

// Cambiar color de otros usuarios
.setLngLat([longitude, latitude])
.addTo(map.current)

// El servidor está en server.ts - agregar lógica de negocio
```

## 🚨 Troubleshooting

| Problema | Solución |
|----------|----------|
| Error: Cannot find module 'socket.io' | Corre `pnpm install` en `/server` |
| "Cannot connect to server" | Verifica que el backend corre en puerto 3001 |
| No ves otras ubicaciones | Abre en otra pestaña/navegador, ambas necesitan geolocation |
| Error de Prisma | Borra `server/prisma/dev.db` y corre `npx prisma migrate dev --name init` |

## 📚 Archivos Nuevos

```
src/
└── hooks/
    └── useLocationSync.ts          (Nueva)

server/                             (Carpeta nueva)
├── src/
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── package.json
└── tsconfig.json

En raíz:
├── TRACKING_README.md              (Este archivo más detallado)
├── setup.bat                        (Script de setup Windows)
└── setup.sh                         (Script de setup Unix/Mac)
```

## 🎓 Próximos Pasos

1. **Ejecutar**: `setup.bat` (o `setup.sh`) 
2. **Iniciar**: 2 terminales con `pnpm dev` (frontend y backend)
3. **Probar**: Abre app en 2 navegadores
4. **Personalizar**: Ajusta colores, usuarios, etc. según necesites

---

**¿Preguntas?** Revisa `TRACKING_README.md` para documentación más detallada.
