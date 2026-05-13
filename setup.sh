#!/bin/bash

echo "🚀 Instalando dependencias del backend..."
cd server
pnpm install
echo "✓ Backend instalado"

echo ""
echo "🗄️ Configurando base de datos con Prisma..."
npx prisma migrate dev --name init
echo "✓ Base de datos configurada"

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "Para iniciar el desarrollo:"
echo ""
echo "Terminal 1 - Frontend:"
echo "  cd .."
echo "  pnpm dev"
echo ""
echo "Terminal 2 - Backend:"
echo "  cd server"
echo "  pnpm dev"
echo ""
