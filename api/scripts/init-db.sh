#!/bin/bash

# Script para inicializar la base de datos en Vercel después del deploy

echo "🚀 Inicializando base de datos en producción..."

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
npx prisma migrate deploy

# Poblar base de datos
echo "🌱 Poblando base de datos con datos iniciales..."
npx prisma db seed

echo "✅ Base de datos inicializada correctamente!"