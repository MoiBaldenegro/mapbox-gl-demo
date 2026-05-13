# Sistema de Rastreo de Ubicación en Tiempo Real

Este proyecto implementa un sistema de rastreo de ubicación en tiempo real usando WebSockets (Socket.IO).

## Estructura

- **Frontend** (`/src`): Aplicación React con Vite
- **Backend** (`/server`): Servidor Node.js con Express y Socket.IO
- **Base de datos**: SQLite con Prisma

## Instalación

### 1. Instalar dependencias del frontend

```bash
cd c:\Users\Moises\bb-ui
pnpm install
```

### 2. Instalar dependencias del backend

```bash
cd server
pnpm install
```

### 3. Configurar Prisma

```bash
cd server
npx prisma migrate dev --name init
```

## Ejecución

### Opción 1: Ejecutar en desarrollo (2 terminales)

**Terminal 1 - Frontend:**
```bash
cd c:\Users\Moises\bb-ui
pnpm dev
```

**Terminal 2 - Backend:**
```bash
cd c:\Users\Moises\bb-ui\server
pnpm dev
```

### Opción 2: Usar scripts de npm

En la raíz del proyecto, puedes agregar:

```bash
pnpm install -D concurrently
```

Y agregar a `package.json`:
```json
"dev:all": "concurrently \"pnpm dev\" \"pnpm --prefix server dev\""
```

Luego ejecutar:
```bash
pnpm dev:all
```

## Variables de Entorno

### Frontend (`.env` o `.env.local`)

```env
VITE_MAPBOX_TOKEN=tu_token_de_mapbox
VITE_SERVER_URL=http://localhost:3001
```

### Backend (`server/.env`)

```env
DATABASE_URL="file:./dev.db"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## Cómo Funciona

1. **Conexión**: El frontend se conecta al servidor WebSocket
2. **Registro**: Cada usuario se registra con un username único
3. **Envío de ubicación**: El geolocation API obtiene la ubicación cada X segundos
4. **Sincronización**: Las ubicaciones se envían al servidor vía Socket.IO
5. **Difusión**: El servidor emite las ubicaciones a todos los clientes conectados
6. **Visualización**: Los marcadores de otros usuarios aparecen en el mapa en tiempo real

## API Endpoints

- `GET /api/health` - Verificar que el servidor está activo
- `GET /api/locations` - Obtener todas las ubicaciones recientes
- `GET /api/users/:userId/location` - Obtener la última ubicación de un usuario

## WebSocket Events

### Cliente → Servidor
- `user_register` - Registrar un nuevo usuario
- `location_update` - Enviar actualización de ubicación

### Servidor → Cliente
- `user_joined` - Un nuevo usuario se conectó
- `location_updated` - Nueva ubicación disponible
- `user_left` - Un usuario se desconectó
- `error` - Error del servidor

## Características

✅ Rastreo en tiempo real de múltiples usuarios
✅ Sincronización de ubicaciones con WebSockets
✅ Persistencia de datos en SQLite
✅ Marcadores de color diferente para usuarios remotos
✅ Información de precisión GPS
✅ Popups con información del usuario

## Pasos Siguientes

Para usar esta funcionalidad en tu app:

1. Abre `src/hooks/useTracking.tsx` - ya está integrado
2. El componente automáticamente:
   - Conecta al servidor
   - Obtiene tu ubicación
   - Envía tu ubicación al servidor
   - Muestra otras ubicaciones en el mapa
3. Abre la app en múltiples pestañas/dispositivos y verás las ubicaciones sincronizadas

## Troubleshooting

### Error de conexión al servidor
- Asegúrate que el backend está corriendo en puerto 3001
- Verifica que `VITE_SERVER_URL` es correcto

### No se ven las ubicaciones remotas
- Abre la app en otro navegador/tab
- Verifica la consola del navegador para errores
- Asegúrate que el geolocation está habilitado

### Error de base de datos
- Elimina `server/prisma/dev.db`
- Corre `npx prisma migrate dev --name init` nuevamente
